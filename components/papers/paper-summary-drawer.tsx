import { useState, useEffect, useCallback, useRef } from "react";
import { Paper } from "@/types/paper";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Copy, Check } from "lucide-react";

interface PaperSummaryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  paper: Paper;
  customSummary?: string;
}

export function PaperSummaryDrawer({ isOpen, onClose, paper, customSummary }: PaperSummaryDrawerProps) {
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  
  // Use refs to track component state and prevent unnecessary re-renders
  const isMounted = useRef(true);
  const currentPaperId = useRef(paper.id);
  
  // Update ref when paper.id changes
  useEffect(() => {
    currentPaperId.current = paper.id;
  }, [paper.id]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Update summary when customSummary prop changes
  useEffect(() => {
    if (customSummary && customSummary.trim() !== "") {
      setSummary(customSummary);
    }
  }, [customSummary]);
  
  // Memoize fetchSummary to prevent recreation on every render
  const fetchSummary = useCallback(async () => {
    // If we already have a customSummary, use that instead of fetching
    if (customSummary && customSummary.trim() !== "") {
      setSummary(customSummary);
      return;
    }
    
    if (!currentPaperId.current || !isMounted.current) return;
    
    setIsLoading(true);
    try {
      // Make API call to get summary
      const response = await fetch('/api/papers/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          paperContent: paper.abstract || `Title: ${paper.title}\nAuthors: ${paper.authors}\nYear: ${paper.year}\nSource: ${paper.source}` 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }
      
      const data = await response.json();
      
      if (isMounted.current) {
        setSummary(data.summary);
      }
    } catch (error) {
      console.error("Error fetching summary:", error);
      if (isMounted.current) {
        toast({
          title: "Error",
          description: "Failed to load the paper summary. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [paper, customSummary, toast]);
  
  // Fetch summary when drawer opens
  useEffect(() => {
    if (isOpen && currentPaperId.current) {
      fetchSummary();
    }
    // Reset summary when drawer closes
    if (!isOpen) {
      setSummary("");
    }
  }, [isOpen, fetchSummary]);
  
  // Memoize copy handler to prevent recreation on every render
  const handleCopySummary = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setIsCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "The summary has been copied to your clipboard.",
      });
      
      // Reset the copied state after 2 seconds
      const timeoutId = setTimeout(() => {
        if (isMounted.current) {
          setIsCopied(false);
        }
      }, 2000);
      
      // Clean up timeout if component unmounts
      return () => clearTimeout(timeoutId);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast({
        title: "Error",
        description: "Failed to copy the summary to clipboard.",
        variant: "destructive",
      });
    }
  }, [summary, toast]);
  
  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{paper.title}</DrawerTitle>
          <DrawerDescription>
            {typeof paper.authors === 'string' ? paper.authors : paper.authors.join(', ')} • {paper.year}
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="p-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
              <Textarea
                value={summary}
                readOnly
                className="min-h-[200px] resize-none"
              />
              
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopySummary}
                  disabled={!summary}
                >
                  {isCopied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Summary
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <DrawerFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
} 