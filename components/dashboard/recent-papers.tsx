"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bookmark, ExternalLink } from "lucide-react"
import { LoadingIndicator } from "@/components/ui/loading-indicator"

export function RecentPapers() {
  const [papers, setPapers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Simulate loading papers
  useEffect(() => {
    const timer = setTimeout(() => {
      // This would normally come from your Supabase database
      setPapers([
        {
          id: "1",
          title: "Advances in Natural Language Processing for Scientific Research",
          authors: "Zhang, J., Smith, A., Johnson, B.",
          journal: "Journal of Computational Linguistics",
          year: 2023,
          tags: ["NLP", "Machine Learning"],
          addedAt: "2 days ago",
        },
        {
          id: "2",
          title: "Quantum Computing Applications in Drug Discovery",
          authors: "Brown, R., Davis, M., Wilson, E.",
          journal: "Nature Quantum Information",
          year: 2023,
          tags: ["Quantum Computing", "Drug Discovery"],
          addedAt: "1 week ago",
        },
        {
          id: "3",
          title: "Climate Change Impact on Biodiversity: A Meta-Analysis",
          authors: "Garcia, L., Martinez, P., Thompson, S.",
          journal: "Environmental Science & Technology",
          year: 2023,
          tags: ["Climate Change", "Biodiversity"],
          addedAt: "2 weeks ago",
        },
      ])
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <LoadingIndicator variant="bar" text="Loading your research papers..." />
  }

  if (papers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <p className="text-muted-foreground">No papers found</p>
        <Button className="mt-4" variant="outline">
          Add your first paper
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {papers.map((paper) => (
        <div key={paper.id} className="flex flex-col space-y-2 rounded-lg border p-4 hover:bg-muted/50">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold">{paper.title}</h3>
              <p className="text-sm text-muted-foreground">{paper.authors}</p>
              <p className="text-xs text-muted-foreground">
                {paper.journal}, {paper.year} • Added {paper.addedAt}
              </p>
            </div>
            <div className="flex space-x-1">
              <Button variant="ghost" size="icon">
                <Bookmark className="h-4 w-4" />
                <span className="sr-only">Bookmark</span>
              </Button>
              <Button variant="ghost" size="icon">
                <ExternalLink className="h-4 w-4" />
                <span className="sr-only">Open</span>
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {paper.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
