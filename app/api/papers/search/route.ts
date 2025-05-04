import { NextResponse } from "next/server";

const SEMANTIC_SCHOLAR_API_URL = "https://api.semanticscholar.org/graph/v1/paper/search";
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

async function fetchWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES, delay = INITIAL_RETRY_DELAY) {
  try {
    const response = await fetch(url, options);
    
    if (response.status === 429 && retries > 0) {
      console.log(`Rate limited. Waiting ${delay/1000} seconds before retry. Retries left: ${retries}`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    
    if (!response.ok) {
      throw new Error(`Semantic Scholar API responded with status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    if (retries > 0 && error instanceof Error && error.message.includes('429')) {
      console.log(`Error: ${error.message}. Retrying in ${delay/1000} seconds. Retries left: ${retries}`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    
    if (!query) {
      return NextResponse.json({ papers: [] });
    }
    
    const offset = (page - 1) * limit;
    
    // Fetch from Semantic Scholar with retry logic
    const response = await fetchWithRetry(
      `${SEMANTIC_SCHOLAR_API_URL}?query=${encodeURIComponent(query)}&offset=${offset}&limit=${limit}`,
      {
        headers: {
          "Accept": "application/json"
        }
      }
    );
    
    const data = await response.json();
    
    // Transform the response to match our Paper type
    const papers = data.data.map((paper: any) => ({
      id: paper.paperId,
      title: paper.title,
      abstract: paper.abstract || "",
      authors: paper.authors?.map((author: any) => author.name).join(", ") || "",
      year: paper.year || 0,
      citations: paper.citationCount || 0,
      url: paper.url || null,
      pdf_url: paper.openAccessPdf?.url || null,
      source: "Semantic Scholar",
      relevance_score: 1, // You might want to calculate this based on your needs
      is_favorite: false
    }));
    
    return NextResponse.json({ papers });
    
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search papers" },
      { status: 500 }
    );
  }
} 