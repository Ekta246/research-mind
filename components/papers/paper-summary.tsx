"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingIndicator } from "@/components/ui/loading-indicator"
import { useToast } from "@/components/ui/use-toast"
import { FileText, Copy } from "lucide-react"

interface PaperSummaryProps {
  paperId: string
  title: string
  abstract: string
  onSummaryGenerated?: (summary: string) => void
}

export function PaperSummary({ paperId, title, abstract, onSummaryGenerated }: PaperSummaryProps) {
  const [summary, setSummary] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const { toast } = useToast()

  const generateSummary = async () => {
    if (isLoading) return
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paperId,
          title,
          abstract
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
      
      if (onSummaryGenerated) {
        onSummaryGenerated(data.summary)
      }
      
      toast({
        title: data.cached ? "Retrieved cached summary" : "Summary generated",
        description: data.cached 
          ? "Retrieved an existing summary for this paper." 
          : "Successfully generated a new summary for this paper.",
      })
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Paper Summary
          </div>
          {summary && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={copyToClipboard} 
              className="h-8 px-2"
            >
              <Copy className="h-4 w-4 mr-1" />
              {isCopied ? "Copied" : "Copy"}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!summary && !isLoading && (
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-center text-muted-foreground mb-4">
              Generate an AI-powered summary of this paper to quickly understand its key points.
            </p>
            <Button onClick={generateSummary}>
              Generate Summary
            </Button>
          </div>
        )}
        
        {isLoading && (
          <LoadingIndicator 
            variant="magnify" 
            text="Generating a concise summary of this paper..." 
          />
        )}
        
        {summary && !isLoading && (
          <div className="prose dark:prose-invert max-w-none">
            <p className="whitespace-pre-line">{summary}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 