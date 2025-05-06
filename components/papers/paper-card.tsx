import { useState } from "react";
import { Paper } from "@/types/paper";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck, ExternalLink, FileText, BookOpen } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useBookmarks } from "@/hooks/useBookmarks";
import { PaperSummaryDrawer } from "./paper-summary-drawer";

interface PaperCardProps {
  paper: Paper;
}

export function PaperCard({ paper }: PaperCardProps) {
  const [summaryDrawerOpen, setSummaryDrawerOpen] = useState(false);
  const { toast } = useToast();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState('');
  
  const handleOpenPaper = (event: React.MouseEvent) => {
    // Make sure we have a URL to open
    if (!paper.url) {
      event.preventDefault();
      toast({
        title: "No link available",
        description: "This paper doesn't have a link to the original source",
        variant: "destructive",
      });
      return;
    }
    
    // Open in new tab
    window.open(paper.url, '_blank', 'noopener,noreferrer');
  };
  
  const handleOpenPDF = (event: React.MouseEvent) => {
    // Check if we have a PDF URL
    if (!paper.pdf_url) {
      event.preventDefault();
      toast({
        title: "No PDF available",
        description: "This paper doesn't have a publicly accessible PDF",
        variant: "destructive",
      });
      return;
    }
    
    // Open in new tab
    window.open(paper.pdf_url, '_blank', 'noopener,noreferrer');
  };
  
  const handleOpenSummary = () => {
    setSummaryDrawerOpen(true);
  };
  
  const handleToggleBookmark = async () => {
    await toggleBookmark(paper);
  };
  
  const handleSummarize = async () => {
    if (summary) {
      // If we already have a summary, just show it again
      onShowSummary(summary);
      return;
    }
    
    setIsSummarizing(true);
    
    try {
      // Get paper content - use abstract if available, otherwise title + metadata
      const paperContent = paper.abstract || 
        `Title: ${paper.title}\nAuthors: ${paper.authors}\nYear: ${paper.year}\nSource: ${paper.source}`;
      
      const response = await fetch('/api/papers/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paperContent }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }
      
      const { summary } = await response.json();
      setSummary(summary);
      onShowSummary(summary);
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        title: 'Summarization failed',
        description: 'Could not generate summary for this paper.',
        variant: 'destructive',
      });
    } finally {
      setIsSummarizing(false);
    }
  };
  
  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center">
                  <h3 className="font-semibold">{paper.title}</h3>
                  {paper.relevance_score && (
                    <Badge className="ml-2" variant="outline">
                      {Math.round(paper.relevance_score * 100)}% match
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {typeof paper.authors === 'string' ? paper.authors : paper.authors.join(', ')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {paper.journal && `${paper.journal}, `}{paper.year}
                  {paper.citations !== undefined && ` • ${paper.citations} citations`}
                  {paper.source && ` • Source: ${paper.source}`}
                </p>
              </div>
              <div className="flex space-x-1">
                {/* <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleToggleBookmark}
                >
                  {isBookmarked(paper.id) ? (
                    <BookmarkCheck className="h-4 w-4 text-primary" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {isBookmarked(paper.id) ? "Unsave" : "Save"}
                  </span>
                </Button> */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleOpenPaper}
                  className={!paper.url ? "opacity-50 cursor-not-allowed" : ""}
                  disabled={!paper.url}
                >
                  <ExternalLink className={`h-4 w-4 ${paper.url ? "text-blue-500" : "text-gray-400"}`} />
                  <span className="sr-only">Open Paper</span>
                </Button>
              </div>
            </div>

            <p className="mt-2 text-sm">{paper.abstract}</p>

            {paper.tags && paper.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {paper.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="mt-4 flex gap-2">
              {paper.pdf_url && (
                <Button 
                  onClick={() => window.open(paper.pdf_url, '_blank')}
                  variant="outline"
                  size="sm"
                >
                  View PDF
                </Button>
              )}
              <Button 
                onClick={handleSummarize}
                variant="outline"
                size="sm"
                disabled={isSummarizing}
              >
                {isSummarizing ? 'Summarizing...' : 'Summarize'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <PaperSummaryDrawer
        isOpen={summaryDrawerOpen}
        onClose={() => setSummaryDrawerOpen(false)}
        paper={paper}
      />
    </>
  );
} 