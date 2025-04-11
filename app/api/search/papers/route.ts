import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Types for our search results
interface Paper {
  id: string
  title: string
  authors: string[]
  abstract: string
  url: string
  publishedDate: string
  journal?: string
  doi?: string
  pdfUrl?: string
  source: "semantic-scholar" | "arxiv" | "web-crawl"
  tags?: string[]
  citationCount?: number
  relevanceScore: number
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("query")
  const limit = parseInt(searchParams.get("limit") || "10", 10)
  const sources = searchParams.get("sources")?.split(",") || ["semantic-scholar", "arxiv", "web-crawl"]
  
  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 }
    )
  }

  try {
    // Collect results from all requested sources
    const results = await Promise.all([
      ...(sources.includes("semantic-scholar") ? [searchSemanticScholar(query, limit)] : []),
      ...(sources.includes("arxiv") ? [searchArxiv(query, limit)] : []),
      ...(sources.includes("web-crawl") ? [searchWebCrawl(query, limit)] : []),
    ])

    // Combine and sort results by relevance
    const papers = results
      .flat()
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit)

    return NextResponse.json({ papers })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json(
      { error: "Failed to search papers" },
      { status: 500 }
    )
  }
}

// Function to search papers from Semantic Scholar
async function searchSemanticScholar(query: string, limit: number): Promise<Paper[]> {
  try {
    // In a production environment, you'd use the actual Semantic Scholar API
    // const response = await fetch(`https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=${limit}`)
    // const data = await response.json()
    
    // For development, we'll use mock data
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate network delay
    
    const mockPapers: Paper[] = Array(Math.ceil(limit / 2))
      .fill(0)
      .map((_, index) => ({
        id: `ss-${Date.now()}-${index}`,
        title: `Semantic Scholar: ${query} - Research Paper ${index + 1}`,
        authors: ["Author A", "Author B", "Author C"].slice(0, Math.floor(Math.random() * 3) + 1),
        abstract: `This paper explores the concept of ${query} and its applications in various fields. The research presents novel findings related to ${query} techniques.`,
        url: `https://example.com/semantic-scholar/${index}`,
        publishedDate: new Date(Date.now() - Math.random() * 31536000000).toISOString().split('T')[0], // Random date within the last year
        journal: Math.random() > 0.3 ? "Journal of Advanced Research" : undefined,
        doi: Math.random() > 0.5 ? `10.1234/s${index}` : undefined,
        source: "semantic-scholar",
        tags: ["Research", "Science", query.split(" ")[0]],
        citationCount: Math.floor(Math.random() * 200),
        relevanceScore: 0.5 + Math.random() * 0.5, // Random score between 0.5 and 1.0
      }))
    
    return mockPapers
  } catch (error) {
    console.error("Semantic Scholar search error:", error)
    return []
  }
}

// Function to search papers from arXiv
async function searchArxiv(query: string, limit: number): Promise<Paper[]> {
  try {
    // In production, you'd use the actual arXiv API
    // const response = await fetch(`http://export.arxiv.org/api/query?search_query=${encodeURIComponent(query)}&max_results=${limit}`)
    // const data = await response.text()
    // Parse the XML response
    
    // For development, we'll use mock data
    await new Promise(resolve => setTimeout(resolve, 700)) // Simulate network delay
    
    const mockPapers: Paper[] = Array(Math.ceil(limit / 3))
      .fill(0)
      .map((_, index) => ({
        id: `arxiv-${Date.now()}-${index}`,
        title: `arXiv: ${query} - Research Findings ${index + 1}`,
        authors: ["Researcher X", "Researcher Y"].slice(0, Math.floor(Math.random() * 2) + 1),
        abstract: `This preprint discusses recent advances in ${query} methodology. We propose a new approach to ${query} that outperforms existing methods.`,
        url: `https://arxiv.org/abs/${index}`,
        publishedDate: new Date(Date.now() - Math.random() * 15768000000).toISOString().split('T')[0], // Random date within the last 6 months
        pdfUrl: `https://arxiv.org/pdf/${index}.pdf`,
        source: "arxiv",
        tags: ["Preprint", query.split(" ")[0], "Analysis"],
        relevanceScore: 0.4 + Math.random() * 0.6, // Random score between 0.4 and 1.0
      }))
    
    return mockPapers
  } catch (error) {
    console.error("arXiv search error:", error)
    return []
  }
}

// Function to search papers from web crawl
async function searchWebCrawl(query: string, limit: number): Promise<Paper[]> {
  try {
    // In production, you'd use a web crawling service or your own indexed database
    // For development, we'll use mock data
    await new Promise(resolve => setTimeout(resolve, 600)) // Simulate network delay
    
    const mockPapers: Paper[] = Array(Math.ceil(limit / 4))
      .fill(0)
      .map((_, index) => ({
        id: `web-${Date.now()}-${index}`,
        title: `Web Source: ${query} - Comprehensive Review ${index + 1}`,
        authors: ["Web Author", "Research Group"].slice(0, Math.floor(Math.random() * 2) + 1),
        abstract: `This web-published article provides a comprehensive overview of ${query}. It includes the latest findings and practical applications in the field.`,
        url: `https://research-web.example.com/papers/${index}`,
        publishedDate: new Date(Date.now() - Math.random() * 7884000000).toISOString().split('T')[0], // Random date within the last 3 months
        source: "web-crawl",
        tags: ["Web", "Review", query.split(" ")[0]],
        relevanceScore: 0.3 + Math.random() * 0.6, // Random score between 0.3 and 0.9
      }))
    
    return mockPapers
  } catch (error) {
    console.error("Web crawl search error:", error)
    return []
  }
} 