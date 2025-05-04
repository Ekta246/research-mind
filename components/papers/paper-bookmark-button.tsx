"use client"

import { useState } from "react"
import { Bookmark, BookmarkCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useBookmarks } from "@/hooks/useBookmarks"

interface PaperBookmarkButtonProps {
  paper: {
    id: string
    title: string
    abstract: string
    authors: string[] | string
    year: number
    [key: string]: any
  }
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  showText?: boolean
}

export function PaperBookmarkButton({
  paper,
  variant = "ghost",
  size = "icon",
  showText = false
}: PaperBookmarkButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { isBookmarked, toggleBookmark } = useBookmarks()
  
  const isFavorite = isBookmarked(paper.id)

  // const handleToggleBookmark = async () => {
  //   if (!paper?.id || isLoading) return
    
  //   setIsLoading(true)
  //   try {
  //     const paperWithFavorite = {
  //       ...paper,
  //       is_favorite: isFavorite
  //     }
  //     await toggleBookmark(paperWithFavorite)
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  return (
    <Button
      variant={variant}
      size={size}
      // onClick={handleToggleBookmark}
      disabled={isLoading}
      aria-label={isFavorite ? "Remove from bookmarks" : "Add to bookmarks"}
    >
      {isFavorite ? (
        <BookmarkCheck className="h-4 w-4 text-primary" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
      {showText && (
        <span className="ml-2">
          {isFavorite ? "Bookmarked" : "Bookmark"}
        </span>
      )}
    </Button>
  )
} 