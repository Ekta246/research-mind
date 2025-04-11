"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  FileText,
  BookOpen,
  MessageSquare,
  ArrowRight,
  Search,
} from "lucide-react"
import { LoadingIndicator } from "@/components/ui/loading-indicator"
import { useToast } from "@/components/ui/use-toast"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { PaperSummaryDrawer } from "./paper-summary-drawer"
import Link from "next/link"

interface Paper {
  id: string
  title: string
  abstract: string
  authors: string
  journal?: string
  year: number
  tags: string[]
  source: string
  citations?: number
  relevance_score: number
  url?: string
  pdf_url?: string
}

interface PaperSearchResultsProps {
  query: string
  isSearching: boolean
  onSavePaper: (paper: Paper) => Promise<void>
  setQuery: (query: string) => void
  cachedResults?: Paper[]
}

export function PaperSearchResults({ query, isSearching, onSavePaper, setQuery, cachedResults }: PaperSearchResultsProps) {
  const [results, setResults] = useState<Paper[]>([])
  const [savedPaperIds, setSavedPaperIds] = useState<Set<string>>(new Set())
  const [recentSearches, setRecentSearches] = useLocalStorage<Paper[]>("recent-paper-searches", [])
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null)
  const [summaryDrawerOpen, setSummaryDrawerOpen] = useState(false)
  const { toast } = useToast()

  // Use cached results if available - only run when cachedResults changes
  useEffect(() => {
    // Only set results if we have valid cached results and they're different from current results
    if (cachedResults && cachedResults.length > 0) {
      // Compare if the cached results are different from current results
      // by checking first item's ID (assuming results maintain same order)
      const currentFirstId = results[0]?.id;
      const cachedFirstId = cachedResults[0]?.id;
      
      if (currentFirstId !== cachedFirstId || results.length !== cachedResults.length) {
        setResults(cachedResults);
      }
    }
  }, [cachedResults]);

  // Fetch search results when query changes
  useEffect(() => {
    // Skip if any of these conditions are true
    if (!query || isSearching) return
    // Only fetch if we don't have cached results
    if (cachedResults && cachedResults.length > 0) return

    // Fetch results from our API (which checks both Supabase and Semantic Scholar)
    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/search?query=${encodeURIComponent(query)}&max_results=10`)
        
        if (!response.ok) {
          throw new Error(`Search failed with status: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.papers && data.papers.length > 0) {
          setResults(data.papers)
          
          // Update recent searches cache (keeping only unique papers by ID)
          setRecentSearches((prev) => {
            const existingIds = new Set(prev.map((p) => p.id))
            const newPapers = data.papers.filter((p: Paper) => !existingIds.has(p.id))
            return [...newPapers, ...prev].slice(0, 8) // Keep only the 8 most recent
          })
        } else {
          setResults([])
        }
      } catch (error) {
        console.error("Error fetching search results:", error)
        toast({
          title: "Search failed",
          description: "Failed to fetch search results. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchResults()
  }, [query, isSearching, toast, setRecentSearches])

  // Load saved paper IDs from Supabase
  useEffect(() => {
    const fetchSavedPapers = async () => {
      try {
        // This would be replaced with your actual Supabase call
        // const { data } = await supabase.from('papers').select('id').eq('user_id', userId).eq('is_favorite', true)
        // if (data) {
        //   setSavedPaperIds(new Set(data.map(p => p.id)))
        // }

        // Mock data for now
        setSavedPaperIds(new Set(["2", "5"]))
      } catch (error) {
        console.error("Error fetching saved papers:", error)
      }
    }

    fetchSavedPapers()
  }, [])

  const handleSavePaper = async (paper: Paper) => {
    try {
      await onSavePaper(paper)

      // Update local state
      setSavedPaperIds((prev) => {
        const newSet = new Set(prev)
        if (newSet.has(paper.id)) {
          newSet.delete(paper.id)
          toast({
            title: "Paper removed",
            description: "Paper removed from your saved collection",
          })
        } else {
          newSet.add(paper.id)
          toast({
            title: "Paper saved",
            description: "Paper added to your saved collection",
          })
        }
        return newSet
      })
    } catch (error) {
      console.error("Error saving paper:", error)
      toast({
        title: "Failed to save",
        description: "There was an error saving this paper. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Add function to handle paper links
  const handleOpenPaper = (paper: Paper, event: React.MouseEvent) => {
    // Make sure we have a URL to open
    if (!paper.url) {
      event.preventDefault();
      toast({
        title: "No link available",
        description: "This paper doesn't have a link to the original source",
        variant: "destructive",
      });
      return;
    }
    
    // Open in new tab
    window.open(paper.url, '_blank', 'noopener,noreferrer');
  };
  
  // Add function to handle PDF links
  const handleOpenPDF = (paper: Paper, event: React.MouseEvent) => {
    // Check if we have a PDF URL
    if (!paper.pdf_url) {
      event.preventDefault();
      toast({
        title: "No PDF available",
        description: "This paper doesn't have a publicly accessible PDF",
        variant: "destructive",
      });
      return;
    }
    
    // Open in new tab
    window.open(paper.pdf_url, '_blank', 'noopener,noreferrer');
  };

  // Add function to handle opening the summary drawer
  const handleOpenSummary = (paper: Paper) => {
    setSelectedPaper(paper)
    setSummaryDrawerOpen(true)
  }

  // If searching, show loading indicator
  if (isSearching) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <LoadingIndicator variant="magnify" text="Searching for relevant papers..." />
        </CardContent>
      </Card>
    )
  }

  // If we have results, show them
  if (results.length > 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Search Results ({results.length})</h2>
        </div>

        <div className="space-y-4">
          {results.map((paper) => (
            <Card key={paper.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <h3 className="font-semibold">{paper.title}</h3>
                        <Badge className="ml-2" variant="outline">
                          {Math.round(paper.relevance_score * 100)}% match
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{paper.authors}</p>
                      <p className="text-xs text-muted-foreground">
                        {paper.journal}, {paper.year} • {paper.citations} citations • Source: {paper.source}
                      </p>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleSavePaper(paper)}>
                        {savedPaperIds.has(paper.id) ? (
                          <BookmarkCheck className="h-4 w-4 text-primary" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                        <span className="sr-only">{savedPaperIds.has(paper.id) ? "Unsave" : "Save"}</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => handleOpenPaper(paper, e)}
                        className={!paper.url ? "opacity-50 cursor-not-allowed" : ""}
                        disabled={!paper.url}
                      >
                        <ExternalLink className={`h-4 w-4 ${paper.url ? "text-blue-500" : "text-gray-400"}`} />
                        <span className="sr-only">Open Paper</span>
                      </Button>
                    </div>
                  </div>

                  <p className="mt-2 text-sm">{paper.abstract}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {paper.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={(e) => handleOpenPDF(paper, e)}
                      disabled={!paper.pdf_url}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      View PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleOpenSummary(paper)}>
                      <BookOpen className="mr-2 h-4 w-4" />
                      Read Summary
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <PaperSummaryDrawer
          isOpen={summaryDrawerOpen}
          onClose={() => setSummaryDrawerOpen(false)}
          paper={selectedPaper}
        />
      </div>
    )
  }

  // If we have recent searches but no current results, show recent searches
  if (recentSearches.length > 0 && !query) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Papers</h2>
        </div>

        <div className="space-y-4">
          {recentSearches.map((paper) => (
            <Card key={paper.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{paper.title}</h3>
                      <p className="text-sm text-muted-foreground">{paper.authors}</p>
                      <p className="text-xs text-muted-foreground">
                        {paper.journal}, {paper.year} • Source: {paper.source}
                      </p>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleSavePaper(paper)}>
                        {savedPaperIds.has(paper.id) ? (
                          <BookmarkCheck className="h-4 w-4 text-primary" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                        <span className="sr-only">{savedPaperIds.has(paper.id) ? "Unsave" : "Save"}</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => handleOpenPaper(paper, e)}
                        className={!paper.url ? "opacity-50 cursor-not-allowed" : ""}
                        disabled={!paper.url}
                      >
                        <ExternalLink className={`h-4 w-4 ${paper.url ? "text-blue-500" : "text-gray-400"}`} />
                        <span className="sr-only">Open Paper</span>
                      </Button>
                    </div>
                  </div>

                  <p className="mt-2 text-sm">{paper.abstract}</p>

                  {paper.tags && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {paper.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={(e) => handleOpenPDF(paper, e)}
                      disabled={!paper.pdf_url}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      View PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleOpenSummary(paper)}>
                      <BookOpen className="mr-2 h-4 w-4" />
                      Read Summary
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <PaperSummaryDrawer
          isOpen={summaryDrawerOpen}
          onClose={() => setSummaryDrawerOpen(false)}
          paper={selectedPaper}
        />
      </div>
    )
  }

  // If no results and no query, suggest using the chatbot
  if (!query) {
    return (
      <>
        <Card className="overflow-hidden">
          <CardContent className="p-8 flex flex-col items-center text-center">
            <div className="mb-6 bg-primary/10 p-4 rounded-full">
              <MessageSquare className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Not sure what to search for?</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Try our AI Research Assistant! Ask questions about topics, concepts, or research areas to get personalized
              recommendations.
            </p>
            <Link href="/dashboard/chat">
              <Button className="group">
                Chat with Research Assistant
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        <PaperSummaryDrawer
          isOpen={summaryDrawerOpen}
          onClose={() => setSummaryDrawerOpen(false)}
          paper={selectedPaper}
        />
      </>
    )
  }

  // If query but no results, show no results message
  if (query && !isSearching && results.length === 0) {
    return (
      <>
        <Card className="overflow-hidden">
          <CardContent className="p-8 flex flex-col items-center text-center">
            <div className="mb-6 bg-muted p-4 rounded-full">
              <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground mb-6">
              We couldn't find any papers matching "{query}". Try adjusting your search terms or filters.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" onClick={() => setQuery("")}>
                Clear Search
              </Button>
              <Link href="/dashboard/chat">
                <Button className="group">
                  Ask Research Assistant
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <PaperSummaryDrawer
          isOpen={summaryDrawerOpen}
          onClose={() => setSummaryDrawerOpen(false)}
          paper={selectedPaper}
        />
      </>
    )
  }

  // Render the drawer even in the null case
  return (
    <PaperSummaryDrawer
      isOpen={summaryDrawerOpen}
      onClose={() => setSummaryDrawerOpen(false)}
      paper={selectedPaper}
    />
  )
}
