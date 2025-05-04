import { useState, useEffect, useCallback, useRef } from "react";
import { Paper } from "@/types/paper";
import { useToast } from "@/components/ui/use-toast";

// Define a type for partial paper with just the required ID
type PartialPaper = Pick<Paper, 'id'> & Partial<Paper>;

export function useBookmarks() {
  const [bookmarkedPapers, setBookmarkedPapers] = useState<Paper[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Use refs to track component state without triggering re-renders
  const isMounted = useRef(true);
  const currentBookmarkedPapers = useRef<Paper[]>([]);
  const currentBookmarkedIds = useRef<Set<string>>(new Set());
  
  // Update refs when state changes
  useEffect(() => {
    currentBookmarkedPapers.current = bookmarkedPapers;
    currentBookmarkedIds.current = bookmarkedIds;
  }, [bookmarkedPapers, bookmarkedIds]);
  
  // Cleanup function to prevent state updates after unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Memoize the fetchBookmarks function to prevent recreating it on every render
  const fetchBookmarks = useCallback(async () => {
    if (isMounted.current) {
      setIsLoading(true);
    }
    
    try {
      const response = await fetch('/api/papers/bookmarks');
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookmarks');
      }
      
      const data = await response.json();
      
      if (isMounted.current) {
        setBookmarkedPapers(data.papers || []);
        setBookmarkedIds(new Set(data.papers?.map((p: Paper) => p.id) || []));
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      if (isMounted.current) {
        toast({
          title: "Error",
          description: "Failed to load your bookmarks. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [toast]);
  
  // Load bookmarks on initial mount
  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);
  
  // Memoize the toggleBookmark function to prevent recreating it on every render
  const toggleBookmark = useCallback(async (paper: PartialPaper) => {
    if (!paper.id) return;
    
    try {
      const response = await fetch('/api/papers/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paperId: paper.id,
          isBookmarked: !currentBookmarkedIds.current.has(paper.id),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle bookmark');
      }
      
      const data = await response.json();
      
      if (isMounted.current) {
        if (data.isBookmarked) {
          // Add to bookmarks - if we have full paper data use it, otherwise just use what we have
          const fullPaper = currentBookmarkedPapers.current.find(p => p.id === paper.id);
          setBookmarkedPapers(prev => [...prev, fullPaper || paper as Paper]);
          setBookmarkedIds(prev => new Set([...prev, paper.id]));
          
          toast({
            title: "Added to bookmarks",
            description: "Paper has been added to your bookmarks.",
          });
        } else {
          // Remove from bookmarks
          setBookmarkedPapers(prev => prev.filter(p => p.id !== paper.id));
          setBookmarkedIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(paper.id);
            return newSet;
          });
          
          toast({
            title: "Removed from bookmarks",
            description: "Paper has been removed from your bookmarks.",
          });
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      if (isMounted.current) {
        toast({
          title: "Error",
          description: "Failed to update bookmark. Please try again.",
          variant: "destructive",
        });
      }
    }
  }, [toast]);
  
  // Memoize the isBookmarked function to prevent recreating it on every render
  const isBookmarked = useCallback((paperId: string) => {
    return currentBookmarkedIds.current.has(paperId);
  }, []);
  
  // Memoize the refreshBookmarks function to prevent recreating it on every render
  const refreshBookmarks = useCallback(async () => {
    await fetchBookmarks();
  }, [fetchBookmarks]);
  
  return {
    bookmarkedPapers,
    bookmarkedIds,
    isLoading,
    isBookmarked,
    toggleBookmark,
    refreshBookmarks,
  };
} 