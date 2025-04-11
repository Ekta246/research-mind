"use client"

import { useState, useEffect } from "react"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose, DrawerFooter } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { LoadingIndicator } from "@/components/ui/loading-indicator"
import { useToast } from "@/components/ui/use-toast"
import { X, Copy, BookOpen } from "lucide-react"

interface PaperSummaryDrawerProps {
  isOpen: boolean
  onClose: () => void
  paper: {
    id: string
    title: string
    abstract: string
    authors: string
  } | null
}

export function PaperSummaryDrawer({ isOpen, onClose, paper }: PaperSummaryDrawerProps) {
  const [summary, setSummary] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const { toast } = useToast()

  // Reset state when paper changes
  useEffect(() => {
    if (paper) {
      setSummary(null)
      setIsLoading(false)
    }
  }, [paper])

  // Generate summary when drawer opens with a paper
  useEffect(() => {
    if (isOpen && paper && !summary && !isLoading) {
      generateSummary()
    }
  }, [isOpen, paper])

  const generateSummary = async () => {
    if (!paper || isLoading) return
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paperId: paper.id,
          title: paper.title,
          abstract: paper.abstract
        })
      })
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      setSummary(data.summary)
      
      if (data.cached) {
        toast({
          title: "Using cached summary",
          description: "Retrieved an existing summary for this paper",
        })
      }
    } catch (error: any) {
      console.error('Summary generation error:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to generate summary. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const copyToClipboard = () => {
    if (!summary) return
    
    navigator.clipboard.writeText(summary)
      .then(() => {
        setIsCopied(true)
        toast({
          title: "Copied to clipboard",
          description: "The summary has been copied to your clipboard.",
        })
        
        // Reset copy state after 2 seconds
        setTimeout(() => setIsCopied(false), 2000)
      })
      .catch((err) => {
        console.error('Failed to copy text:', err)
        toast({
          title: "Copy failed",
          description: "Failed to copy text to clipboard. Please try again.",
          variant: "destructive"
        })
      })
  }

  if (!paper) return null

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b px-4 py-3 flex items-center justify-between">
          <DrawerTitle className="pr-8 text-lg flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-primary" />
            Paper Summary
          </DrawerTitle>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>
        
        <div className="px-4 py-3 bg-muted/50">
          <h3 className="font-medium">{paper.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{paper.authors}</p>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <LoadingIndicator 
              variant="magnify" 
              text="Generating a concise summary of this paper..." 
            />
          ) : summary ? (
            <div className="prose dark:prose-invert max-w-none">
              <p className="whitespace-pre-line text-base">{summary}</p>
            </div>
          ) : (
            <div className="text-center p-6">
              <p>Failed to generate summary. Please try again.</p>
              <Button onClick={generateSummary} className="mt-4">
                Retry
              </Button>
            </div>
          )}
        </div>
        
        <DrawerFooter className="border-t px-4 py-3">
          <div className="flex justify-between">
            <p className="text-xs text-muted-foreground">
              Summary generated using AI from the paper's abstract
            </p>
            {summary && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={copyToClipboard}
                className="h-8"
              >
                <Copy className="h-4 w-4 mr-1" />
                {isCopied ? "Copied!" : "Copy Text"}
              </Button>
            )}
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
} 