"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, FileText, Loader2, Save } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Paper {
  id: string
  title: string
  abstract: string
  authors: string[]
}

export default function NewSummaryPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [selectedPapers, setSelectedPapers] = useState<string[]>([])
  const [availablePapers, setAvailablePapers] = useState<Paper[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch available papers
  useEffect(() => {
    const fetchPapers = async () => {
      try {
        setIsLoading(true)
        
        // Simulate API call with mock data
        setTimeout(() => {
          const mockPapers = [
            {
              id: "paper1",
              title: "Large Language Models in Research",
              abstract: "This paper explores the applications of large language models in academic research.",
              authors: ["Smith, J.", "Johnson, A."]
            },
            {
              id: "paper2",
              title: "Deep Learning Advancements",
              abstract: "Recent advancements in deep learning architectures and their applications.",
              authors: ["Zhang, L.", "Brown, T."]
            },
            {
              id: "paper3",
              title: "Climate Change Impact Assessment",
              abstract: "A comprehensive analysis of climate change impacts on global ecosystems.",
              authors: ["Garcia, M.", "Wilson, P."]
            }
          ];
          
          setAvailablePapers(mockPapers);
          setIsLoading(false);
        }, 1000);
        
        // TODO: Replace with actual API call when implemented
        // const response = await fetch("/api/papers");
        // if (!response.ok) throw new Error("Failed to fetch papers");
        // const data = await response.json();
        // setAvailablePapers(data.papers || []);
        
      } catch (error) {
        console.error("Error fetching papers:", error);
        toast({
          title: "Error",
          description: "Failed to load papers. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    fetchPapers();
  }, [toast]);

  const handlePaperSelection = (paperId: string) => {
    if (selectedPapers.includes(paperId)) {
      setSelectedPapers(selectedPapers.filter(id => id !== paperId));
    } else {
      setSelectedPapers([...selectedPapers, paperId]);
    }
  };

  const handleGenerateSummary = async () => {
    if (selectedPapers.length === 0) {
      toast({
        title: "Selection required",
        description: "Please select at least one paper to generate a summary",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate API call
      setTimeout(() => {
        const papers = selectedPapers.map(id => 
          availablePapers.find(paper => paper.id === id)
        ).filter(Boolean);

        // Generate a title if not set by user
        if (!title.trim() && papers.length > 0) {
          if (papers.length === 1) {
            setTitle(`Summary of "${papers[0]?.title}"`);
          } else {
            setTitle(`Summary of ${papers.length} papers on ${papers[0]?.title.split(' ')[0]}`);
          }
        }

        // Generate mock content
        setContent(
          `This is an AI-generated summary of the selected paper(s):\n\n` +
          `The research focuses on ${papers.map(p => p?.title.toLowerCase()).join(' and ')}. ` +
          `Key findings include important discoveries in these areas, with significant implications for future research. ` +
          `The methodologies employed demonstrate innovative approaches to solving complex problems in the field. ` +
          `Further research is recommended to explore additional aspects not covered in the current papers.`
        );

        setIsGenerating(false);
      }, 2000);

      // TODO: Replace with actual API call when implemented
      // const response = await fetch("/api/summarize", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ paperIds: selectedPapers }),
      // });
      // if (!response.ok) throw new Error("Failed to generate summary");
      // const data = await response.json();
      // setContent(data.summary);
      // if (!title && data.suggestedTitle) setTitle(data.suggestedTitle);

    } catch (error) {
      console.error("Error generating summary:", error);
      toast({
        title: "Error",
        description: "Failed to generate summary. Please try again.",
        variant: "destructive",
      });
      setIsGenerating(false);
    }
  };

  const handleSaveSummary = async () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a title for the summary",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please generate or write summary content",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      setTimeout(() => {
        toast({
          title: "Summary saved",
          description: "Your summary has been saved successfully",
        });
        setIsSubmitting(false);
        router.push("/dashboard/summaries");
      }, 1000);

      // TODO: Replace with actual API call when implemented
      // const response = await fetch("/api/summaries", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     title,
      //     content,
      //     paper_ids: selectedPapers,
      //   }),
      // });
      // if (!response.ok) throw new Error("Failed to save summary");
      // router.push("/dashboard/summaries");

    } catch (error) {
      console.error("Error saving summary:", error);
      toast({
        title: "Error",
        description: "Failed to save summary. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Create New Summary"
        description="Generate and save AI summaries of your research papers."
        icon={<FileText className="h-6 w-6" />}
      />
      
      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={() => router.push("/dashboard/summaries")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Summaries
        </Button>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Select Papers to Summarize</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-[200px] items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : availablePapers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No papers found in your library.</p>
                  <p className="text-sm">Add papers to your library to create summaries.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {availablePapers.map((paper) => (
                    <div 
                      key={paper.id} 
                      className={`p-3 rounded-md cursor-pointer border ${
                        selectedPapers.includes(paper.id) 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => handlePaperSelection(paper.id)}
                    >
                      <h3 className="font-medium">{paper.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {paper.abstract}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Authors: {paper.authors.join(", ")}
                      </p>
                    </div>
                  ))}
                  
                  <Button 
                    className="w-full mt-4" 
                    onClick={handleGenerateSummary}
                    disabled={selectedPapers.length === 0 || isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        Generate Summary
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a title for this summary"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Summary content will appear here after generation"
                    className="min-h-[200px]"
                  />
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={handleSaveSummary} 
                  disabled={!title || !content || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Summary
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
} 