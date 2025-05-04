"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { PapersList } from "@/components/papers/papers-list"
import { PaperFilters } from "@/components/papers/paper-filters"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Search, BookMarked } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function BookmarksPage() {
  const [papers, setPapers] = useState<any[]>([])
  const [filteredPapers, setFilteredPapers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  // Fetch bookmarked papers
  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/papers/bookmarks")
        
        if (!response.ok) {
          throw new Error("Failed to fetch bookmarked papers")
        }
        
        const data = await response.json()
        setPapers(data.papers || [])
        setFilteredPapers(data.papers || [])
      } catch (error) {
        console.error("Error fetching bookmarks:", error)
        toast({
          title: "Error",
          description: "Failed to load bookmarked papers. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookmarks()
  }, [toast])

  // Handle search functionality
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPapers(papers)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = papers.filter(
      (paper) =>
        paper.title?.toLowerCase().includes(query) ||
        paper.abstract?.toLowerCase().includes(query) ||
        paper.authors?.some((author: string) => 
          author.toLowerCase().includes(query)
        )
    )
    setFilteredPapers(filtered)
  }, [searchQuery, papers])

  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Handle bookmark removal
  const handleToggleBookmark = async (paperId: string) => {
    try {
      const response = await fetch("/api/papers/bookmarks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paperId, isBookmarked: false }),
      })

      if (!response.ok) {
        throw new Error("Failed to remove bookmark")
      }
      
      const data = await response.json();

      // Update the UI by removing the paper from the list
      setPapers(prevPapers => prevPapers.filter(paper => paper.id !== paperId))
      
      // Update filtered papers as well to maintain UI consistency
      setFilteredPapers(prevPapers => prevPapers.filter(paper => paper.id !== paperId))
      
      toast({
        title: "Success",
        description: "Paper removed from bookmarks",
      })
    } catch (error) {
      console.error("Error removing bookmark:", error)
      toast({
        title: "Error",
        description: "Failed to remove paper from bookmarks",
        variant: "destructive",
      })
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Bookmarked Papers"
        description="View and manage your favorite papers."
        icon={<BookMarked className="h-6 w-6" />}
      />
      
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search your bookmarks..."
              className="pl-8"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <PaperFilters />
        </div>

        {isLoading ? (
          <div className="flex h-[400px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : papers.length === 0 ? (
          <div className="flex h-[400px] flex-col items-center justify-center space-y-3 rounded-lg border border-dashed p-8 text-center">
            <BookMarked className="h-10 w-10 text-muted-foreground" />
            <div className="space-y-1">
              <h3 className="font-semibold">No bookmarked papers</h3>
              <p className="text-sm text-muted-foreground">
                You haven&apos;t bookmarked any papers yet.
              </p>
            </div>
            <Button 
              variant="outline"
              onClick={() => window.location.href = "/dashboard/search"}
            >
              Find papers to bookmark
            </Button>
          </div>
        ) : (
          <PapersList 
            papers={filteredPapers} 
            // onToggleBookmark={handleToggleBookmark}
            showBookmarkButton={true}
          />
        )}
      </div>
    </DashboardShell>
  )
} 