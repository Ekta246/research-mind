"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Filter, Calendar, Tag, Users } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PaperSearchResults } from "@/components/search/paper-search-results"
import { useToast } from "@/components/ui/use-toast"

// Define a cache type
interface SearchCache {
  query: string
  results: any[]
  timestamp: number
}

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [cache, setCache] = useState<Record<string, SearchCache>>({})
  const { toast } = useToast()

  // Load cache from localStorage on component mount
  useEffect(() => {
    const savedCache = localStorage.getItem("search-cache")
    if (savedCache) {
      try {
        setCache(JSON.parse(savedCache))
      } catch (error) {
        console.error("Failed to parse search cache:", error)
      }
    }
  }, [])

  // Save cache to localStorage whenever it changes
  useEffect(() => {
    if (Object.keys(cache).length > 0) {
      localStorage.setItem("search-cache", JSON.stringify(cache))
    }
  }, [cache])

  const handleSearch = async () => {
    if (!query.trim()) return

    // Check if we have a valid cached result (less than 1 hour old)
    const cachedResult = cache[query]
    if (cachedResult && Date.now() - cachedResult.timestamp < 3600000) {
      toast({
        title: "Using cached results",
        description: "Showing results from your previous search",
      })
      return
    }

    setIsSearching(true)

    try {
      // Real API call to arXiv
      const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`)
      
      if (!response.ok) {
        throw new Error(`Search failed with status: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Save results to cache
      setCache(prevCache => ({
        ...prevCache,
        [query]: {
          query,
          results: data.papers,
          timestamp: Date.now()
        }
      }))
    } catch (error) {
      console.error("Search error:", error)
      toast({
        title: "Search failed",
        description: "Failed to fetch search results. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleSavePaper = async (paper: any) => {
    try {
      const response = await fetch('/api/papers/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paper }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save paper: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Return the success response
      return data;
    } catch (error) {
      console.error('Error saving paper:', error);
      toast({
        title: "Save failed",
        description: "Failed to save the paper. Please try again.",
        variant: "destructive",
      });
      throw error; // Re-throw to let the component handle it
    }
  }

  // Helper function to clear the cache
  const clearCache = () => {
    setCache({})
    localStorage.removeItem("search-cache")
    toast({
      title: "Cache cleared",
      description: "Your search cache has been cleared",
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Search Research Papers</h1>
        <p className="text-muted-foreground">Find relevant papers across multiple academic sources</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search for papers, authors, topics..."
                  className="pl-10"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <Button onClick={handleSearch} disabled={!query.trim() || isSearching}>
                {isSearching ? "Searching..." : "Search"}
              </Button>
              <Button variant="outline" onClick={clearCache} title="Clear search cache">
                Clear Cache
              </Button>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
                <Select defaultValue="all">
                  <SelectTrigger>
                    <Calendar className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                    <SelectItem value="2021">2021</SelectItem>
                    <SelectItem value="2020">2020</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="all">
                  <SelectTrigger>
                    <Tag className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Topic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Topics</SelectItem>
                    <SelectItem value="ai">Artificial Intelligence</SelectItem>
                    <SelectItem value="ml">Machine Learning</SelectItem>
                    <SelectItem value="quantum">Quantum Computing</SelectItem>
                    <SelectItem value="climate">Climate Science</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="all">
                  <SelectTrigger>
                    <Users className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Author" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Authors</SelectItem>
                    <SelectItem value="smith">Smith, A.</SelectItem>
                    <SelectItem value="johnson">Johnson, B.</SelectItem>
                    <SelectItem value="davis">Davis, M.</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="relevance">
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="date">Date (Newest)</SelectItem>
                    <SelectItem value="citations">Citations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <PaperSearchResults 
        query={query} 
        isSearching={isSearching} 
        onSavePaper={handleSavePaper} 
        setQuery={setQuery} 
        cachedResults={cache[query]?.results} 
      />
    </div>
  )
}
