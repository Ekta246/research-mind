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

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('query')
    // Always request more results than we need for better relevance filtering
    const maxResults = parseInt(searchParams.get('max_results') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const finalResultCount = 8; // We'll return the top 8 most relevant results
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    // Initialize Supabase client to check existing papers
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Failed to initialize database connection' },
        { status: 500 }
      )
    }

    // First, check if we have matching papers in our database
    const { data: existingPapers, error: dbError } = await supabase
      .from('papers')
      .select('*')
      .textSearch('title', query, { 
        type: 'websearch',
        config: 'english' 
      })
      .limit(maxResults)
    
    if (dbError) {
      console.error('Database search error:', dbError)
      // Continue with API search even if DB search fails
    }
    
    let papers: FormattedPaper[] = [];
    
    // Process existing papers if available
    if (existingPapers && existingPapers.length > 0) {
      // Convert database results to FormattedPaper
      papers = existingPapers.map(paper => ({
        id: paper.id,
        title: paper.title,
        abstract: paper.abstract,
        authors: paper.authors.join(', '),
        year: paper.year,
        tags: paper.tags || [],
        source: paper.source || 'Database',
        url: paper.url || '',
        pdf_url: paper.pdf_url,
        relevance_score: 0, // Will calculate this below
        citations: paper.citations || 0,
        journal: paper.journal || '',
      }));
    }

    // If we don't have enough results, search Semantic Scholar API
    if (papers.length < finalResultCount) {
      const semanticScholarUrl = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=${maxResults}&offset=${offset}&fields=title,authors,year,abstract,url,venue,citationCount,openAccessPdf`
      
      const response = await fetch(semanticScholarUrl, {
        headers: {
          'Accept': 'application/json',
          // Note: For production use, you should register for an API key
          // 'x-api-key': process.env.SEMANTIC_SCHOLAR_API_KEY,
        },
      })

      if (!response.ok) {
        throw new Error(`Semantic Scholar API responded with status: ${response.status}`)
      }

      const data = await response.json() as SemanticScholarResponse
      
      // Format the response to match our paper schema
      const apiPapers: FormattedPaper[] = data.data.map((paper: SemanticScholarPaper) => {
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
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const paperInserts = topPapers.map(paper => ({
        ...paper,
        user_id: user.id,
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
    }

    return NextResponse.json({
      papers: topPapers,
      total: papers.length,
      itemsPerPage: finalResultCount,
      startIndex: offset,
      source: existingPapers && existingPapers.length > 0 ? 'combined' : 'semantic_scholar'
    })
  } catch (error: any) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to search for papers' },
      { status: 500 }
    )
  }
} 