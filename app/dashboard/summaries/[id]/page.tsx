"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, FileText, Loader2, Copy, Pencil, Trash, BookOpen } from "lucide-react"
import Link from "next/link"

interface Summary {
  id: string
  title: string
  content: string
  paper_ids: string[]
  created_at: string
  updated_at: string
}

interface Paper {
  id: string
  title: string
  authors: string[]
}

export default function SummaryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { toast } = useToast()
  const [summary, setSummary] = useState<Summary | null>(null)
  const [relatedPapers, setRelatedPapers] = useState<Paper[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Unwrap params using React.use()
  const resolvedParams = use(params)

  // Fetch summary data
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setIsLoading(true)
        
        // Simulate API call with mock data
        setTimeout(() => {
          // Check if ID matches one of our mocks
          if (resolvedParams.id === "1") {
            const mockSummary = {
              id: "1",
              title: "Large Language Models in Research",
              content: `This is a summary of large language models and their applications in academic research. 
              
The paper discusses various techniques and methodologies for improving LLM performance in specialized domains. Key findings include improved performance when models are fine-tuned on domain-specific data.

Research implications:
- Better understanding of model limitations
- Practical applications in scientific research
- Potential for accelerating discovery processes

Further research is recommended to address ethical considerations and potential biases inherent in current model architectures.`,
              paper_ids: ["paper1", "paper2"],
              created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
              updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
            };
            
            const mockPapers = [
              {
                id: "paper1",
                title: "Large Language Models in Research",
                authors: ["Smith, J.", "Johnson, A."]
              },
              {
                id: "paper2",
                title: "Deep Learning Advancements",
                authors: ["Zhang, L.", "Brown, T."]
              }
            ];
            
            setSummary(mockSummary);
            setRelatedPapers(mockPapers);
          } else if (resolvedParams.id === "2") {
            const mockSummary = {
              id: "2",
              title: "Climate Change Analysis",
              content: "The paper presents a comprehensive analysis of climate change impacts on global ecosystems. It leverages data from multiple sources to provide insights into future climate scenarios and potential adaptation strategies.",
              paper_ids: ["paper3"],
              created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
              updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
            };
            
            const mockPapers = [
              {
                id: "paper3",
                title: "Climate Change Impact Assessment",
                authors: ["Garcia, M.", "Wilson, P."]
              }
            ];
            
            setSummary(mockSummary);
            setRelatedPapers(mockPapers);
          } else {
            // If ID doesn't match our mocks, just return null
            setSummary(null);
            setRelatedPapers([]);
          }
          
          setIsLoading(false);
        }, 500); // Simulate network delay
      } catch (error) {
        console.error("Error fetching summary:", error);
        toast({
          title: "Error",
          description: "Failed to load summary. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [resolvedParams.id, toast]); // Add resolvedParams.id to dependencies

  const handleCopySummary = () => {
    if (!summary) return;
    
    navigator.clipboard.writeText(summary.content);
    toast({
      title: "Copied",
      description: "Summary copied to clipboard",
    });
  };

  const handleDeleteSummary = async () => {
    if (!summary) return;
    
    // Confirm delete
    if (!window.confirm("Are you sure you want to delete this summary? This action cannot be undone.")) {
      return;
    }
    
    setIsDeleting(true);
    try {
      // Simulate API call
      setTimeout(() => {
        toast({
          title: "Summary deleted",
          description: "Your summary has been deleted successfully",
        });
        setIsDeleting(false);
        router.push("/dashboard/summaries");
      }, 1000);

      // TODO: Replace with actual API call when implemented
      // const response = await fetch(`/api/summaries/${resolvedParams.id}`, {
      //   method: "DELETE",
      // });
      // if (!response.ok) throw new Error("Failed to delete summary");
      // router.push("/dashboard/summaries");

    } catch (error) {
      console.error("Error deleting summary:", error);
      toast({
        title: "Error",
        description: "Failed to delete summary. Please try again.",
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Summary Details"
        description="View and manage your research paper summary."
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

        {isLoading ? (
          <div className="flex h-[400px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !summary ? (
          <div className="flex h-[400px] flex-col items-center justify-center space-y-3 rounded-lg border border-dashed p-8 text-center">
            <FileText className="h-10 w-10 text-muted-foreground" />
            <div className="space-y-1">
              <h3 className="font-semibold">Summary not found</h3>
              <p className="text-sm text-muted-foreground">
                The summary you're looking for doesn't exist or has been deleted.
              </p>
            </div>
            <Button 
              variant="outline"
              onClick={() => router.push("/dashboard/summaries")}
            >
              Go back to summaries
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{summary.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-line">
                    {summary.content}
                  </div>
                </CardContent>
                <CardFooter className="border-t p-4 flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    Created on {formatDate(summary.created_at)}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleCopySummary}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      asChild
                    >
                      <Link href={`/dashboard/summaries/${resolvedParams.id}/edit`}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={handleDeleteSummary}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Trash className="mr-2 h-4 w-4" />
                      )}
                      Delete
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Related Papers</CardTitle>
                </CardHeader>
                <CardContent>
                  {relatedPapers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No papers associated with this summary.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {relatedPapers.map((paper) => (
                        <div key={paper.id} className="border rounded-md p-3">
                          <h3 className="font-medium text-sm">{paper.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {paper.authors.join(", ")}
                          </p>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mt-2"
                            asChild
                          >
                            <Link href={`/dashboard/papers/${paper.id}`}>
                              <BookOpen className="mr-2 h-3.5 w-3.5" />
                              View paper
                            </Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
} 