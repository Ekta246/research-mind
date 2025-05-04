"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Bookmark, BookmarkCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useBookmarks } from "@/hooks/useBookmarks"
import { cn } from "@/lib/utils"

interface BookmarkButtonProps {
  paperId: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
  className?: string
}

export function BookmarkButton({
  paperId,
  variant = "ghost",
  size = "sm",
  className = ""
}: BookmarkButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { toggleBookmark, isBookmarked } = useBookmarks()
  
  // Use a ref to track if the component is mounted
  const isMounted = useRef(true)
  
  // Use a ref to store the current paperId to avoid stale closures
  const currentPaperId = useRef(paperId)
  
  // Update the ref when paperId changes
  useEffect(() => {
    currentPaperId.current = paperId
  }, [paperId])
  
  // Cleanup function to prevent state updates after unmount
  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])
  
  // Check initial bookmark status
  useEffect(() => {
    if (paperId) {
      setIsFavorite(isBookmarked(paperId))
    }
  }, [paperId, isBookmarked])
  
  const handleToggleBookmark = async () => {
    if (!paperId) return
    
    setIsLoading(true)
    try {
      // Create a minimal paper object with just the ID
      const paper = { id: paperId }
      
      // Use the toggleBookmark function from the hook
      await toggleBookmark(paper)
      
      // Update local state based on the hook's isBookmarked function
      if (isMounted.current) {
        const newBookmarkState = isBookmarked(paperId)
        setIsFavorite(newBookmarkState)
      }
      
      // Show appropriate toast message
      toast({
        title: isFavorite ? "Removed from bookmarks" : "Added to bookmarks",
        description: isFavorite 
          ? "Paper has been removed from your bookmarks." 
          : "Paper has been added to your bookmarks.",
      })
    } catch (error) {
      console.error("Error toggling bookmark:", error)
      toast({
        title: "Error",
        description: "Failed to update bookmark status. Please try again.",
        variant: "destructive",
      })
    } finally {
      if (isMounted.current) {
        setIsLoading(false)
      }
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        className,
        "transition-colors duration-200",
        isFavorite && "bg-primary text-primary-foreground hover:bg-primary/90"
      )}
      // onClick={handleToggleBookmark}
      disabled={isLoading}
    >
      {isFavorite ? (
        <BookmarkCheck className="h-4 w-4 mr-2" />
      ) : (
        <Bookmark className="h-4 w-4 mr-2" />
      )}
      {isFavorite ? "Bookmarked" : "Bookmark"}
    </Button>
  )
} 