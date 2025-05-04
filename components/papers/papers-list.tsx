"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, ExternalLink, Bookmark, BookmarkCheck } from "lucide-react"
import Link from "next/link"

interface Paper {
  id: string
  title: string
  abstract: string
  authors: string[] | string
  year?: number
  url?: string
  is_favorite?: boolean
}

interface PapersListProps {
  papers: Paper[]
  onToggleBookmark?: (paperId: string) => Promise<void>
  showBookmarkButton?: boolean
}

export function PapersList({ papers, onToggleBookmark, showBookmarkButton = false }: PapersListProps) {
  const [bookmarkLoading, setBookmarkLoading] = useState<string | null>(null)

  const handleToggleBookmark = async (paperId: string) => {
    if (!onToggleBookmark) return
    
    setBookmarkLoading(paperId)
    try {
      await onToggleBookmark(paperId)
    } finally {
      setBookmarkLoading(null)
    }
  }

  const formatAuthors = (authors: string[] | string) => {
    if (!authors) return "Unknown authors"
    
    if (typeof authors === 'string') {
      return authors
    }
    
    if (authors.length === 0) return "Unknown authors"
    if (authors.length === 1) return authors[0]
    if (authors.length === 2) return `${authors[0]} and ${authors[1]}`
    return `${authors[0]}, ${authors[1]}, et al.`
  }

  return (
    <div className="space-y-4">
      {papers.map((paper) => (
        <Card key={paper.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{paper.title}</CardTitle>
                <CardDescription>{formatAuthors(paper.authors)}</CardDescription>
              </div>
              {paper.year && (
                <Badge variant="outline" className="ml-2">
                  {paper.year}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {paper.abstract}
            </p>
            <div className="flex justify-between items-center mt-2">
              <div className="flex space-x-2">
                {showBookmarkButton && onToggleBookmark && (
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleBookmark(paper.id)}
                    disabled={bookmarkLoading === paper.id}
                  >
                    {paper.is_favorite ? (
                      <>
                        <BookmarkCheck className="h-4 w-4 mr-2 text-primary" />
                        Remove
                      </>
                    ) : (
                      <>
                        <Bookmark className="h-4 w-4 mr-2" />
                        Bookmark
                      </>
                    )}
                  </Button>
                )}
              </div>
              <div className="flex space-x-2">
                {paper.url && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    asChild
                  >
                    <Link href={paper.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Source
                    </Link>
                  </Button>
                )}
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/dashboard/papers/${paper.id}`}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Read Paper
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 