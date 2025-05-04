"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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
  Loader2,
} from "lucide-react"
import { LoadingIndicator } from "@/components/ui/loading-indicator"
import { useToast } from "@/components/ui/use-toast"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { PaperSummaryDrawer } from "./paper-summary-drawer"
import Link from "next/link"
import { Paper } from "@/types/paper"
import { PaperCard } from "@/components/papers/paper-card"

interface PaperSearchResultsProps {
  query: string
  isSearching: boolean
  onSavePaper: (paper: Paper) => Promise<void>
  setQuery: (query: string) => void
  cachedResults?: Paper[]
  onResultsChange?: (results: Paper[]) => void
}

export function PaperSearchResults({ query, isSearching, onSavePaper, setQuery, cachedResults, onResultsChange }: PaperSearchResultsProps) {
  const [results, setResults] = useState<Paper[]>([])
  const [savedPaperIds, setSavedPaperIds] = useState<Set<string>>(new Set())
  const [recentSearches, setRecentSearches] = useLocalStorage<Paper[]>("recent-paper-searches", [])
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null)
  const [summaryDrawerOpen, setSummaryDrawerOpen] = useState(false)
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  
  // Use refs to track component state without triggering re-renders
  const isMounted = useRef(true)
  const currentQuery = useRef(query)
  const currentPage = useRef(page)
  const currentResults = useRef<Paper[]>([])
  
  // Update refs when props/state change
  useEffect(() => {
    currentQuery.current = query
    currentPage.current = page
    currentResults.current = results
  }, [query, page, results])
  
  // Cleanup function to prevent state updates after unmount
  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])
  
  // Memoize the fetchResults function to prevent recreating it on every render
  const fetchResults = useCallback(async (searchQuery: string, pageNum: number) => {
    if (!searchQuery.trim()) {
      if (isMounted.current) {
        setResults([])
        setHasMore(false)
      }
      return
    }
    
    if (isMounted.current) {
      setIsLoading(true)
      setError(null)
    }
    
    try {
      const response = await fetch(
        `/api/papers/search?query=${encodeURIComponent(searchQuery)}&page=${pageNum}`
      )
      
      if (!response.ok) {
        throw new Error("Failed to fetch search results")
      }
      
      const data = await response.json()
      
      if (isMounted.current) {
        // For first page, replace results; for subsequent pages, append
        if (pageNum === 1) {
          setResults(data.papers)
        } else {
          setResults(prev => [...prev, ...data.papers])
        }
        
        setHasMore(data.papers.length > 0)
        
        // Notify parent component if callback provided
        if (onResultsChange) {
          onResultsChange(pageNum === 1 ? data.papers : [...currentResults.current, ...data.papers])
        }
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : "An error occurred")
        console.error("Search error:", err)
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false)
      }
    }
  }, [onResultsChange])
  
  // Handle initial search and query changes
  useEffect(() => {
    setPage(1)
    fetchResults(query, 1)
  }, [query, fetchResults])
  
  // Handle pagination
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      const nextPage = currentPage.current + 1
      setPage(nextPage)
      fetchResults(currentQuery.current, nextPage)
    }
  }, [isLoading, hasMore, fetchResults])
  
  // Use cached results if available
  useEffect(() => {
    if (cachedResults && cachedResults.length > 0) {
      // Compare if the cached results are different from current results
      const currentFirstId = currentResults.current[0]?.id
      const cachedFirstId = cachedResults[0]?.id
      
      if (currentFirstId !== cachedFirstId || currentResults.current.length !== cachedResults.length) {
        setResults(cachedResults)
      }
    }
  }, [cachedResults])

  // Load saved paper IDs from Supabase
  useEffect(() => {
    const fetchSavedPapers = async () => {
      try {
        // Fetch bookmarked papers from our API
        const response = await fetch('/api/papers/bookmarks')
        if (response.ok) {
          const data = await response.json()
          if (data.papers && data.papers.length > 0) {
            // Create a set of bookmarked paper IDs
            setSavedPaperIds(new Set(data.papers.map((p: any) => p.id)))
          }
        } else {
          console.error("Error fetching bookmarked papers:", response.statusText)
        }
      } catch (error) {
        console.error("Error fetching saved papers:", error)
      }
    }

    fetchSavedPapers()
  }, [])

  const handleSavePaper = async (paper: Paper) => {
    try {
      // First, make sure we save the paper to our database if it's not already there
      await onSavePaper(paper)

      // Check if paper is currently bookmarked 
      const isFavorite = !savedPaperIds.has(paper.id)
      
      // Call our bookmark API
      const response = await fetch('/api/papers/bookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          paperId: paper.id,
          isFavorite: isFavorite
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update bookmark status')
      }

      // Update local state
      setSavedPaperIds((prev) => {
        const newSet = new Set(prev)
        if (newSet.has(paper.id)) {
          newSet.delete(paper.id)
          toast({
            title: "Paper removed",
            description: "Paper removed from your bookmarks",
          })
        } else {
          newSet.add(paper.id)
          toast({
            title: "Paper saved",
            description: "Paper added to your bookmarks",
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
      event.preventDefault()
      toast({
        title: "No link available",
        description: "This paper doesn't have a link to the original source",
        variant: "destructive",
      })
      return
    }
    
    // Open in new tab
    window.open(paper.url, '_blank', 'noopener,noreferrer')
  }
  
  // Add function to handle PDF links
  const handleOpenPDF = (paper: Paper, event: React.MouseEvent) => {
    // Check if we have a PDF URL
    if (!paper.pdf_url) {
      event.preventDefault()
      toast({
        title: "No PDF available",
        description: "This paper doesn't have a publicly accessible PDF",
        variant: "destructive",
      })
      return
    }
    
    // Open in new tab
    window.open(paper.pdf_url, '_blank', 'noopener,noreferrer')
  }

  // Add function to handle opening the summary drawer
  const handleOpenSummary = (paper: Paper) => {
    setSelectedPaper(paper)
    setSummaryDrawerOpen(true)
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <Button 
          variant="outline" 
          onClick={() => fetchResults(query, 1)}
          className="mt-4"
        >
          Try Again
                    </Button>
      </div>
    )
  }

  if (results.length === 0 && !isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {query ? "No papers found matching your search." : "Enter a search term to find papers."}
      </div>
    )
  }

    return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {results.map((paper) => (
          <PaperCard key={paper.id} paper={paper} />
        ))}
          </div>
      
      {hasMore && (
        <div className="flex justify-center mt-6">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
            </Button>
        </div>
      )}
      
      <PaperSummaryDrawer
        isOpen={summaryDrawerOpen}
        onClose={() => setSummaryDrawerOpen(false)}
        paper={selectedPaper}
      />
          </div>
    )
}
