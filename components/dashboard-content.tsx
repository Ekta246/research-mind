"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, Search, Clock, TrendingUp } from "lucide-react"
import { RecentPapers } from "@/components/recent-papers"
import { TrendingPapers } from "@/components/trending-papers"
import { SearchResults } from "@/components/search-results"

export function DashboardContent() {
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("recent")

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="grid gap-6">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">Manage your research papers and discover new content</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search papers..."
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              New Paper
            </Button>
          </div>
        </div>

        <Tabs defaultValue="recent" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="recent">
              <Clock className="mr-2 h-4 w-4" />
              Recent
            </TabsTrigger>
            <TabsTrigger value="trending">
              <TrendingUp className="mr-2 h-4 w-4" />
              Trending
            </TabsTrigger>
            {searchQuery && (
              <TabsTrigger value="search">
                <Search className="mr-2 h-4 w-4" />
                Search Results
              </TabsTrigger>
            )}
          </TabsList>
          <TabsContent value="recent">
            <RecentPapers />
          </TabsContent>
          <TabsContent value="trending">
            <TrendingPapers />
          </TabsContent>
          {searchQuery && (
            <TabsContent value="search">
              <SearchResults query={searchQuery} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}
