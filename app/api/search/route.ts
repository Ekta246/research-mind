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
              // Rate limit - wait longer before retrying with exponential backoff
              console.log(`Rate limited. Waiting ${waitTime/1000} seconds before retry`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
              waitTime *= 2; // Double the wait time for next retry
            } else {
              // For other errors, use standard backoff
              await new Promise(resolve => setTimeout(resolve, waitTime));
            }
            retries--;
            if (retries === 0) {
              // On final retry, just continue without throwing - use what we have
              console.error(`Failed to fetch from Semantic Scholar after multiple retries. Status: ${response.status}`);
              break;
            }
            continue;
          }
          
          apiData = await response.json() as SemanticScholarResponse;
          break;
        } catch (error) {
          console.error("Error fetching from Semantic Scholar:", error);
          retries--;
          if (retries === 0) {
            // On final retry, just continue without throwing
            break;
          }
          // Wait before retrying with exponential backoff
          await new Promise(resolve => setTimeout(resolve, waitTime));
          waitTime *= 2;
        }
      }
      
      // If we have API data, format it and add to results
      if (apiData) {
        // Format the response to match our paper schema
        const apiPapers: FormattedPaper[] = apiData.data.map((paper: SemanticScholarPaper) => {
          // Format authors 
          const authors = paper.authors 
            ? paper.authors.map((author) => author.name).join(', ')
            : 'Unknown'
          
          // Generate better URLs for the paper and PDF
          const { url, pdfUrl } = buildPaperUrls(paper);
          
          // Create a paper object matching our schema
          return {
            id: paper.paperId,
            title: paper.title || 'Unknown Title',
            abstract: paper.abstract || 'No abstract available',
            authors,
            year: paper.year || new Date().getFullYear(),
            tags: [], // Semantic Scholar doesn't provide tags
            source: 'Semantic Scholar',
            url: url,
            pdf_url: pdfUrl,
            relevance_score: 0, // Will calculate this below
            citations: paper.citationCount || 0,
            journal: paper.venue || 'Unknown',
          }
        })
        
        // Combine results, deduplicating by ID
        const existingIds = new Set(papers.map(p => p.id))
        const newPapers = apiPapers.filter(p => !existingIds.has(p.id))
        papers = [...papers, ...newPapers]
      } else {
        // Log an informational message and continue - don't fail the whole request
        console.info("Couldn't retrieve data from Semantic Scholar API - using local data only");
      }
    }
    
    // Calculate relevance scores for all papers
    for (const paper of papers) {
      paper.relevance_score = calculateRelevanceScore(query, paper);
    }
    
    // Sort by relevance score (descending)
    papers.sort((a, b) => b.relevance_score - a.relevance_score);
    
    // Take only the top results
    const topPapers = papers.slice(0, finalResultCount);
    
    // If the user is authenticated, save new papers to the database
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Use the dev-user ID if no authenticated user
      const userId = user?.id || 'dev-user';
      
      const paperInserts = topPapers.map(paper => ({
        ...paper,
        user_id: userId,
        is_favorite: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))
      
      // Upsert papers (insert if not exists, update if exists)
      const { error: insertError } = await supabase
        .from('papers')
        .upsert(paperInserts, { 
          onConflict: 'id',
          ignoreDuplicates: true 
        })
      
      if (insertError) {
        console.error('Error saving papers to database:', insertError)
      }
    } catch (error) {
      console.error('Error saving papers:', error);
      // Continue even if saving fails
    }
    
    // Prepare the response with source information
    const hasSemanticScholarData = papers.some(p => p.source === 'Semantic Scholar');
    const response = {
      papers: topPapers,
      total: papers.length,
      itemsPerPage: finalResultCount,
      startIndex: offset,
      source: hasSemanticScholarData ? 
        (existingPapers && existingPapers.length > 0 ? 'combined' : 'semantic_scholar') : 
        'local_only'
    };
    
    // Cache the results
    cacheResults(query, maxResults, response);
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to search for papers' },
      { status: 500 }
    )
  }
} 