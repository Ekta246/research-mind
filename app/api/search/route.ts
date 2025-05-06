import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// Define types for Semantic Scholar API response
interface SemanticScholarAuthor {
  authorId: string
  name: string
}

interface SemanticScholarPaper {
  paperId: string
  title: string
  abstract?: string
  authors: SemanticScholarAuthor[]
  year?: number
  url?: string
  venue?: string
  citationCount?: number
  openAccessPdf?: {
    url: string
  }
}

interface SemanticScholarResponse {
  data: SemanticScholarPaper[]
  total?: number
}

// Define a type for our formatted paper
interface FormattedPaper {
  id: string
  title: string
  abstract: string
  authors: string
  year: number
  tags: string[]
  source: string
  url: string
  pdf_url: string | null
  relevance_score: number
  citations: number
  journal: string
}

// Calculate relevance score between query and paper content
function calculateRelevanceScore(query: string, paper: { title: string, abstract: string, year?: number }): number {
  // Normalize the query and paper text (lowercase everything)
  const normalizedQuery = query.toLowerCase();
  const normalizedTitle = paper.title.toLowerCase();
  const normalizedAbstract = (paper.abstract || '').toLowerCase();
  
  // Split query into words for better matching
  const queryWords = normalizedQuery.split(/\s+/).filter(word => word.length > 2);
  
  // Base score starts at 0.5
  let score = 0.5;
  
  // Direct keyword matches in title are heavily weighted
  if (normalizedTitle.includes(normalizedQuery)) {
    score += 0.3; // Exact query match in title
  }
  
  // Count how many query words appear in the title and abstract
  let titleMatchCount = 0;
  let abstractMatchCount = 0;
  
  for (const word of queryWords) {
    if (normalizedTitle.includes(word)) {
      titleMatchCount++;
    }
    if (normalizedAbstract.includes(word)) {
      abstractMatchCount++;
    }
  }
  
  // Calculate percentage of query words that match
  const titleMatchRatio = queryWords.length > 0 ? titleMatchCount / queryWords.length : 0;
  const abstractMatchRatio = queryWords.length > 0 ? abstractMatchCount / queryWords.length : 0;
  
  // Weight title matches higher than abstract matches
  score += (titleMatchRatio * 0.15); // Up to 0.15 for title matches
  score += (abstractMatchRatio * 0.05); // Up to 0.05 for abstract matches
  
  // Recent papers get a slight boost (papers from last 3 years)
  const currentYear = new Date().getFullYear();
  if (paper.year && (currentYear - paper.year) <= 3) {
    score += 0.05;
  }
  
  // Normalize score to ensure it's between 0 and 1
  return Math.min(1, Math.max(0, score));
}

// Helper function to build better paper URLs based on source/ID
function buildPaperUrls(paper: SemanticScholarPaper): { url: string, pdfUrl: string | null } {
  const paperId = paper.paperId;
  let url = paper.url || '';
  let pdfUrl = paper.openAccessPdf?.url || null;
  
  // If we don't have a URL but have a paperId, construct one
  if (!url && paperId) {
    // Check if it's likely an arXiv ID
    if (paperId.match(/^\d+\.\d+$/)) {
      url = `https://arxiv.org/abs/${paperId}`;
      pdfUrl = pdfUrl || `https://arxiv.org/pdf/${paperId}.pdf`;
    } 
    // DOI format
    else if (paperId.match(/^10\.\d+\//)) {
      url = `https://doi.org/${paperId}`;
    }
    // Default to Semantic Scholar
    else {
      url = `https://www.semanticscholar.org/paper/${paperId}`;
    }
  }
  
  // Handle special cases for known repositories
  if (url.includes('arxiv.org/abs/')) {
    // For arXiv papers, make sure we have a PDF link
    pdfUrl = pdfUrl || url.replace('arxiv.org/abs/', 'arxiv.org/pdf/') + '.pdf';
  } else if (url.includes('doi.org/')) {
    // DOI URLs generally don't have direct PDF links unless provided
    // But we can check for common patterns
    if (!pdfUrl && url.includes('10.1101/')) {
      // bioRxiv/medRxiv pattern
      const biorxivId = url.split('10.1101/')[1];
      if (biorxivId) {
        pdfUrl = `https://www.biorxiv.org/content/10.1101/${biorxivId}.full.pdf`;
      }
    }
  }
  
  return { url, pdfUrl };
}

// Simple in-memory cache for search results
// Note: This will reset when the server restarts
type CacheEntry = {
  timestamp: number;
  data: any;
}

const CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes in milliseconds
const searchCache = new Map<string, CacheEntry>();

// Clear expired cache entries
function clearExpiredCache() {
  const now = Date.now();
  for (const [key, entry] of searchCache.entries()) {
    if (now - entry.timestamp > CACHE_EXPIRY) {
      searchCache.delete(key);
    }
  }
}

// Check cache for query
function getCachedResults(query: string, maxResults: number): any | null {
  clearExpiredCache();
  const cacheKey = `${query}:${maxResults}`;
  const cached = searchCache.get(cacheKey);
  
  if (cached && (Date.now() - cached.timestamp < CACHE_EXPIRY)) {
    console.log(`Using cached search results for "${query}"`);
    return cached.data;
  }
  
  return null;
}

// Save results to cache
function cacheResults(query: string, maxResults: number, data: any) {
  const cacheKey = `${query}:${maxResults}`;
  searchCache.set(cacheKey, {
    timestamp: Date.now(),
    data
  });
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const query = url.searchParams.get('query') || ''
    const maxResults = parseInt(url.searchParams.get('max_results') || '10')
    const offset = parseInt(url.searchParams.get('offset') || '0')
    
    if (!query.trim()) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }
    
    // Check cache first
    const cachedData = getCachedResults(query, maxResults);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }
    
    // Initialize Supabase client
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Failed to initialize database connection' }, { status: 500 })
    }
    
    // For development/demo, use a fixed user ID
    const userId = 'dev-user' 
    
    // Try to fetch existing papers from our database first
    let papers: FormattedPaper[] = []
    let existingPapers = null
    
    const { data: dbPapers, error: dbError } = await supabase
      .from('papers')
      .select('*')
      .eq('user_id', userId)
      .or(`title.ilike.%${query}%,abstract.ilike.%${query}%`)
      .order('created_at', { ascending: false })
    
    if (dbError) {
      console.error('Error fetching papers from DB:', dbError)
    } else {
      existingPapers = dbPapers
      papers = [...papers, ...dbPapers]
    }
    
    // Calculate how many external results we need
    const finalResultCount = Math.min(maxResults, 4)
    const externalResultsNeeded = finalResultCount - papers.length
    
    // Only fetch from external API if we need more results
    if (externalResultsNeeded > 0) {
      // COMMENTED OUT SEMANTIC SCHOLAR API CALLS
      /*
      const semanticScholarUrl = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=${maxResults}&offset=${offset}&fields=title,authors,year,abstract,url,venue,citationCount,openAccessPdf`
      
      // Add retry logic for API calls with exponential backoff
      let retries = 3;
      let apiData = null;
      let waitTime = 1000; // Start with 1 second delay
      
      while (retries > 0 && !apiData) {
        try {
          const response = await fetch(semanticScholarUrl, {
            headers: {
              'Accept': 'application/json',
              // Note: For production use, you should register for an API key
              // 'x-api-key': process.env.SEMANTIC_SCHOLAR_API_KEY,
            },
            // Add a cache policy for the fetch request
            cache: 'force-cache',
          });
          
          if (!response.ok) {
            console.warn(`Semantic Scholar API responded with status: ${response.status}. Retries left: ${retries-1}`);
            if (response.status === 429) {
              // Rate limited, wait progressively longer
              await new Promise(resolve => setTimeout(resolve, waitTime));
              waitTime *= 2; // Exponential backoff
              retries--;
              continue;
            }
            throw new Error(`Semantic Scholar API responded with status: ${response.status}`);
          }
          
          apiData = await response.json();
        } catch (error) {
          console.error('Error fetching from Semantic Scholar:', error);
          retries--;
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, waitTime));
            waitTime *= 2;
          }
        }
      }
      
      if (apiData && apiData.data && apiData.data.length > 0) {
        // Format papers from the Semantic Scholar API
        const semanticScholarPapers = apiData.data.map((paper: SemanticScholarPaper): FormattedPaper => {
          const { url, pdfUrl } = buildPaperUrls(paper);
          
          // Calculate relevance score for this paper
          const relevanceScore = calculateRelevanceScore(query, {
            title: paper.title,
            abstract: paper.abstract || '',
            year: paper.year
          });
          
          // Check if paper is already in our database
          const existingPaper = existingPapers?.find(p => 
            p.id === paper.paperId || 
            (p.title === paper.title && p.authors === paper.authors?.map(a => a.name).join(', '))
          );
          
          return {
            id: paper.paperId,
            title: paper.title,
            abstract: paper.abstract || "",
            authors: paper.authors?.map(author => author.name).join(", ") || "",
            year: paper.year || 0,
            tags: [],
            source: "Semantic Scholar",
            url: url,
            pdf_url: pdfUrl,
            relevance_score: relevanceScore,
            citations: paper.citationCount || 0,
            journal: paper.venue || "",
          };
        });
        
        // Add to our results
        papers = [...papers, ...semanticScholarPapers];
      }
      */
      
      // NEW CODE: Use arXiv and PubMed APIs instead
      try {
        // Call arXiv API
        const formattedQuery = encodeURIComponent(query.replace(/\s+/g, '+'));
        const arxivUrl = `http://export.arxiv.org/api/query?search_query=all:${formattedQuery}&start=0&max_results=${maxResults}`;
        
        const arxivResponse = await fetch(arxivUrl);
        if (arxivResponse.ok) {
          const arxivData = await arxivResponse.text();
          
          // Parse arXiv XML response
          const arxivPapers: FormattedPaper[] = [];
          const entries = arxivData.split('<entry>').slice(1);
          
          for (const entry of entries) {
            const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim() || '';
            const abstract = entry.match(/<summary>([\s\S]*?)<\/summary>/)?.[1]?.trim() || '';
            const published = entry.match(/<published>(.*?)<\/published>/)?.[1] || '';
            const year = published ? new Date(published).getFullYear() : 0;
            const id = entry.match(/<id>(.*?)<\/id>/)?.[1]?.split('/').pop() || '';
            
            // Extract authors
            const authorRegex = /<author>([\s\S]*?)<\/author>/g;
            const authorMatches = [...entry.matchAll(authorRegex)];
            const authors = authorMatches
              .map(match => match[1].match(/<name>(.*?)<\/name>/)?.[1] || '')
              .filter(Boolean)
              .join(', ');
            
            // Calculate relevance score
            const relevanceScore = calculateRelevanceScore(query, {
              title,
              abstract,
              year
            });
            
            arxivPapers.push({
              id,
              title,
              abstract,
              authors,
              year,
              tags: [],
              source: "arXiv",
              url: entry.match(/<id>(.*?)<\/id>/)?.[1] || '',
              pdf_url: entry.match(/<link title="pdf" href="(.*?)"/)?.[1] || null,
              relevance_score: relevanceScore,
              citations: 0,
              journal: "arXiv",
            });
          }
          
          // Add to our results
          papers = [...papers, ...arxivPapers];
        }
        
        // Call PubMed API
        const pubmedSearchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmode=json&retmax=${maxResults}`;
        
        const pubmedSearchResponse = await fetch(pubmedSearchUrl);
        if (pubmedSearchResponse.ok) {
          const pubmedSearchData = await pubmedSearchResponse.json();
          const ids = pubmedSearchData.esearchresult.idlist;
          
          if (ids && ids.length > 0) {
            // Fetch details for those IDs
            const detailsUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`;
            
            const detailsResponse = await fetch(detailsUrl);
            if (detailsResponse.ok) {
              const detailsData = await detailsResponse.json();
              
              const pubmedPapers: FormattedPaper[] = [];
              for (const id of ids) {
                const item = detailsData.result[id];
                if (!item) continue;
                
                const title = item.title || '';
                const authors = item.authors?.map((a: any) => a.name).join(', ') || '';
                const year = item.pubdate?.split(' ')?.[0] || 0;
                
                // Calculate relevance score
                const relevanceScore = calculateRelevanceScore(query, {
                  title,
                  abstract: '',  // PubMed summary doesn't include abstract
                  year: parseInt(year)
                });
                
                pubmedPapers.push({
                  id: item.uid,
                  title,
                  abstract: '', // PubMed summary doesn't include abstract
                  authors,
                  year: parseInt(year) || 0,
                  tags: [],
                  source: "PubMed",
                  url: `https://pubmed.ncbi.nlm.nih.gov/${item.uid}/`,
                  pdf_url: null,
                  relevance_score: relevanceScore,
                  citations: 0,
                  journal: item.fulljournalname || '',
                });
              }
              
              // Add to our results
              papers = [...papers, ...pubmedPapers];
            }
          }
        }
      } catch (error) {
        console.error('Error fetching external papers:', error);
      }
    }
    
    // Deduplicate papers based on ID
    const uniqueIds = new Set();
    papers = papers.filter(paper => {
      if (uniqueIds.has(paper.id)) {
        return false;
      }
      uniqueIds.add(paper.id);
      return true;
    });
    
    // Sort papers by relevance
    papers.sort((a, b) => b.relevance_score - a.relevance_score);
    
    // Limit to requested result count
    papers = papers.slice(0, maxResults);
    
    // Cache the results
    cacheResults(query, maxResults, { papers, total: papers.length });
    
    return NextResponse.json({ papers, total: papers.length });
    
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search for papers', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 