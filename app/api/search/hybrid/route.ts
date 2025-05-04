import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { OpenAI } from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Define types for search results
interface SearchResult {
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
  semantic_score: number
  combined_score: number
  citations: number
  journal: string
}

// Cache for search results
const searchCache: Record<string, { timestamp: number, data: SearchResult[] }> = {}
const CACHE_EXPIRY = 1000 * 60 * 60 // 1 hour

// Clear expired cache entries
function clearExpiredCache() {
  const now = Date.now()
  Object.keys(searchCache).forEach(key => {
    if (now - searchCache[key].timestamp > CACHE_EXPIRY) {
      delete searchCache[key]
    }
  })
}

// Get cached results if available
function getCachedResults(query: string, maxResults: number): SearchResult[] | null {
  clearExpiredCache()
  const cacheKey = `${query}-${maxResults}`
  const cached = searchCache[cacheKey]
  
  if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
    return cached.data
  }
  
  return null
}

// Cache search results
function cacheResults(query: string, maxResults: number, data: SearchResult[]) {
  const cacheKey = `${query}-${maxResults}`
  searchCache[cacheKey] = {
    timestamp: Date.now(),
    data
  }
}

// Calculate semantic similarity using embeddings
async function calculateSemanticSimilarity(query: string, papers: any[]): Promise<number[]> {
  try {
    // Generate embedding for the query
    const queryEmbedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    })
    
    // Generate embeddings for each paper (title + abstract)
    const paperEmbeddings = await Promise.all(
      papers.map(async (paper) => {
        const text = `${paper.title} ${paper.abstract || ''}`
        const embedding = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: text,
        })
        return embedding
      })
    )
    
    // Calculate cosine similarity between query and each paper
    const queryVector = queryEmbedding.data[0].embedding
    return paperEmbeddings.map(embedding => {
      const paperVector = embedding.data[0].embedding
      return cosineSimilarity(queryVector, paperVector)
    })
  } catch (error) {
    console.error('Error calculating semantic similarity:', error)
    return papers.map(() => 0.5) // Default score if embedding fails
  }
}

// Calculate cosine similarity between two vectors
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0
  
  let dotProduct = 0
  let normA = 0
  let normB = 0
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i]
    normA += vecA[i] * vecA[i]
    normB += vecB[i] * vecB[i]
  }
  
  if (normA === 0 || normB === 0) return 0
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

// Calculate keyword relevance score
function calculateKeywordScore(query: string, paper: { title: string, abstract: string, year?: number }): number {
  // Normalize the query and paper text (lowercase everything)
  const normalizedQuery = query.toLowerCase()
  const normalizedTitle = paper.title.toLowerCase()
  const normalizedAbstract = (paper.abstract || '').toLowerCase()
  
  // Split query into words for better matching
  const queryWords = normalizedQuery.split(/\s+/).filter(word => word.length > 2)
  
  // Base score starts at 0.5
  let score = 0.5
  
  // Direct keyword matches in title are heavily weighted
  if (normalizedTitle.includes(normalizedQuery)) {
    score += 0.3 // Exact query match in title
  }
  
  // Count how many query words appear in the title and abstract
  let titleMatchCount = 0
  let abstractMatchCount = 0
  
  for (const word of queryWords) {
    if (normalizedTitle.includes(word)) {
      titleMatchCount++
    }
    if (normalizedAbstract.includes(word)) {
      abstractMatchCount++
    }
  }
  
  // Calculate percentage of query words that match
  const titleMatchRatio = queryWords.length > 0 ? titleMatchCount / queryWords.length : 0
  const abstractMatchRatio = queryWords.length > 0 ? abstractMatchCount / queryWords.length : 0
  
  // Weight title matches higher than abstract matches
  score += (titleMatchRatio * 0.15) // Up to 0.15 for title matches
  score += (abstractMatchRatio * 0.05) // Up to 0.05 for abstract matches
  
  // Recent papers get a slight boost (papers from last 3 years)
  const currentYear = new Date().getFullYear()
  if (paper.year && (currentYear - paper.year) <= 3) {
    score += 0.05
  }
  
  // Normalize score to ensure it's between 0 and 1
  return Math.min(1, Math.max(0, score))
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const query = url.searchParams.get('q') || ''
    const maxResults = parseInt(url.searchParams.get('limit') || '20')
    const useCache = url.searchParams.get('cache') !== 'false'
    
    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
    }
    
    // Check cache first if enabled
    if (useCache) {
      const cachedResults = getCachedResults(query, maxResults)
      if (cachedResults) {
        return NextResponse.json({
          results: cachedResults,
          total: cachedResults.length,
          cached: true
        })
      }
    }
    
    // Initialize Supabase client
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Failed to initialize database connection' }, { status: 500 })
    }
    
    // DEVELOPMENT: Skip authentication check
    // const { data: { user } } = await supabase.auth.getUser()
    // if (!user) {
    //   return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    // }
    
    // For development, use a fixed user ID
    const devUserId = 'dev-user'
    
    // Get papers from database
    const { data: papers, error } = await supabase
      .from('papers')
      .select('*')
      .eq('user_id', devUserId)
      .order('created_at', { ascending: false })
      .limit(100) // Limit to 100 papers for performance
    
    if (error) {
      console.error('Error fetching papers:', error)
      return NextResponse.json({ error: 'Failed to fetch papers' }, { status: 500 })
    }
    
    if (!papers || papers.length === 0) {
      return NextResponse.json({
        results: [],
        total: 0
      })
    }
    
    // Calculate keyword relevance scores
    const keywordScores = papers.map(paper => 
      calculateKeywordScore(query, { 
        title: paper.title, 
        abstract: paper.abstract || '', 
        year: paper.year 
      })
    )
    
    // Calculate semantic similarity scores
    const semanticScores = await calculateSemanticSimilarity(query, papers)
    
    // Combine scores (70% semantic, 30% keyword)
    const combinedScores = semanticScores.map((semanticScore, i) => 
      (semanticScore * 0.7) + (keywordScores[i] * 0.3)
    )
    
    // Format results with both scores
    const results: SearchResult[] = papers.map((paper, i) => ({
      id: paper.id,
      title: paper.title,
      abstract: paper.abstract || '',
      authors: paper.authors || '',
      year: paper.year || 0,
      tags: paper.tags || [],
      source: paper.source || '',
      url: paper.url || '',
      pdf_url: paper.pdf_url,
      relevance_score: keywordScores[i],
      semantic_score: semanticScores[i],
      combined_score: combinedScores[i],
      citations: paper.citations || 0,
      journal: paper.journal || ''
    }))
    
    // Sort by combined score
    results.sort((a, b) => b.combined_score - a.combined_score)
    
    // Limit results
    const limitedResults = results.slice(0, maxResults)
    
    // Cache results
    cacheResults(query, maxResults, limitedResults)
    
    return NextResponse.json({
      results: limitedResults,
      total: results.length,
      cached: false
    })
    
  } catch (error: any) {
    console.error('Hybrid search error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to perform hybrid search' },
      { status: 500 }
    )
  }
} 