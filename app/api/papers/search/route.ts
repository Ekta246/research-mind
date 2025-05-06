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

async function searchArxiv(query: string) {
  const formattedQuery = encodeURIComponent(query.replace(/\s+/g, '+'));
  const url = `http://export.arxiv.org/api/query?search_query=all:${formattedQuery}&start=0&max_results=10`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`arXiv API error: ${response.status}`);
  }
  
  const data = await response.text();
  // Simple XML parsing - in production use a proper XML parser
  const papers = [];
  // Extract papers from XML (simplified)
  const entries = data.split('<entry>').slice(1);
  
  for (const entry of entries) {
    const title = entry.match(/<title>(.*?)<\/title>/s)?.[1]?.trim() || '';
    const abstract = entry.match(/<summary>(.*?)<\/summary>/s)?.[1]?.trim() || '';
    const published = entry.match(/<published>(.*?)<\/published>/)?.[1] || '';
    const year = published ? new Date(published).getFullYear() : 0;
    const id = entry.match(/<id>(.*?)<\/id>/)?.[1]?.split('/').pop() || '';
    
    const authorMatches = entry.matchAll(/<author>(.*?)<\/author>/gs);
    const authors = [];
    for (const match of authorMatches) {
      const name = match[1].match(/<name>(.*?)<\/name>/)?.[1] || '';
      if (name) authors.push(name);
    }
    
    papers.push({
      id,
      title,
      abstract,
      authors: authors.join(', '),
      year,
      citations: 0,
      url: entry.match(/<id>(.*?)<\/id>/)?.[1] || null,
      pdf_url: entry.match(/<link title="pdf" href="(.*?)"/)?.[1] || null,
      source: "arXiv",
      relevance_score: 0.8,
      is_favorite: false
    });
  }
  
  return papers;
}

async function searchPubMed(query: string) {
  // Use PubMed E-utilities
  const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmode=json&retmax=10`;
  
  const searchResponse = await fetch(searchUrl);
  if (!searchResponse.ok) {
    throw new Error(`PubMed search API error: ${searchResponse.status}`);
  }
  
  const searchData = await searchResponse.json();
  const ids = searchData.esearchresult.idlist;
  
  if (!ids || ids.length === 0) {
    return [];
  }
  
  // Fetch details for those IDs
  const detailsUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`;
  
  const detailsResponse = await fetch(detailsUrl);
  if (!detailsResponse.ok) {
    throw new Error(`PubMed details API error: ${detailsResponse.status}`);
  }
  
  const detailsData = await detailsResponse.json();
  
  // Format the results
  const papers = [];
  for (const id of ids) {
    const item = detailsData.result[id];
    if (!item) continue;
    
    papers.push({
      id: item.uid,
      title: item.title || '',
      abstract: '',  // PubMed summary doesn't include abstract
      authors: item.authors?.map((a: any) => a.name).join(', ') || '',
      year: item.pubdate?.split(' ')?.[0] || 0,
      citations: 0,
      url: `https://pubmed.ncbi.nlm.nih.gov/${item.uid}/`,
      pdf_url: null,
      source: "PubMed",
      relevance_score: 0.7,
      is_favorite: false
    });
  }
  
  return papers;
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
    
    // Try Semantic Scholar first with a 3-second timeout
    try {
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Semantic Scholar request timed out')), 3000)
      );
      const semanticPromise = fetchWithRetry(
        `${SEMANTIC_SCHOLAR_API_URL}?query=${encodeURIComponent(query)}&offset=${offset}&limit=${limit}`,
        {
          headers: {
            "Accept": "application/json"
          }
        }
      );
      const result = await Promise.race([semanticPromise, timeout]);
      
      if (result && result.ok) {
        const data = await result.json();
        
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
      }
    } catch (error) {
      console.error('Semantic Scholar error:', error);
      // Continue to fallbacks
    }
    
    // Parallel fallback to arXiv and PubMed
    try {
      const [arxivResults, pubmedResults] = await Promise.all([
        searchArxiv(query),
        searchPubMed(query)
      ]);
      
      const combinedResults = [
        ...arxivResults.map(paper => ({ ...paper, source: 'arxiv' })),
        ...pubmedResults.map(paper => ({ ...paper, source: 'pubmed' }))
      ];
      
      return NextResponse.json({ 
        papers: combinedResults,
        source: 'combined', 
        note: 'Results from fallback sources (arXiv, PubMed)' 
      });
    } catch (error) {
      console.error('Fallback search error:', error);
      throw new Error('All search services failed');
    }
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search papers" },
      { status: 500 }
    );
  }
} 