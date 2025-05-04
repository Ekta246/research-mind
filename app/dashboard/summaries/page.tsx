"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, FileText, Search, Plus, BookOpen, Copy, FileOutput } from "lucide-react"
import Link from "next/link"

interface Summary {
  id: string
  title: string
  content: string
  paper_ids: string[]
  created_at: string
  updated_at: string
}

export default function SummariesPage() {
  const [summaries, setSummaries] = useState<Summary[]>([])
  const [filteredSummaries, setFilteredSummaries] = useState<Summary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  // For now, use mock data until API is implemented
  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        setIsLoading(true)
        
        // Simulate API call with mock data
        setTimeout(() => {
          // Generate 23 mock summaries to match dashboard count
          const mockSummaryTitles = [
            "Large Language Models in Research",
            "Climate Change Analysis",
            "Quantum Computing Applications",
            "Advancements in Renewable Energy",
            "Neural Networks for Medical Diagnosis",
            "COVID-19 Vaccine Development",
            "Machine Learning Ethics",
            "Blockchain in Healthcare",
            "Space Exploration Technologies",
            "Artificial Intelligence in Education",
            "Sustainable Agriculture Methods",
            "Human-Computer Interaction",
            "Robotics and Automation",
            "Dark Matter Research",
            "Microplastics in Oceans",
            "Gene Editing with CRISPR",
            "Mental Health Interventions",
            "Smart City Infrastructure",
            "Cybersecurity Frameworks",
            "Virtual Reality Applications",
            "Protein Folding Algorithms",
            "Advanced Materials Science",
            "Social Media Impact Studies"
          ];
          
          const mockSummaries = mockSummaryTitles.map((title, index) => ({
            id: (index + 1).toString(),
            title,
            content: `This is a summary of research on ${title.toLowerCase()}. The paper discusses various techniques, methodologies, and findings related to this important area of study.`,
            paper_ids: [Math.random().toString(36).substring(7)],
            created_at: new Date(Date.now() - (Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
            updated_at: new Date(Date.now() - (Math.random() * 15 * 24 * 60 * 60 * 1000)).toISOString()
          }));
          
          setSummaries(mockSummaries);
          setFilteredSummaries(mockSummaries);
          setIsLoading(false);
        }, 1000);
        
        // TODO: Replace with actual API call when implemented
        // const response = await fetch("/api/summaries");
        // if (!response.ok) throw new Error("Failed to fetch summaries");
        // const data = await response.json();
        // setSummaries(data.summaries || []);
        // setFilteredSummaries(data.summaries || []);
        
      } catch (error) {
        console.error("Error fetching summaries:", error);
        toast({
          title: "Error",
          description: "Failed to load summaries. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    fetchSummaries();
  }, [toast]);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSummaries(summaries);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = summaries.filter(
      (summary) =>
        summary.title.toLowerCase().includes(query) ||
        summary.content.toLowerCase().includes(query)
    );
    setFilteredSummaries(filtered);
  }, [searchQuery, summaries]);

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleCopySummary = (summary: Summary) => {
    navigator.clipboard.writeText(summary.content);
    toast({
      title: "Copied",
      description: "Summary copied to clipboard",
    });
  };

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Research Summaries"
        description={`Manage and generate AI summaries of your research papers. (${summaries.length} summaries)`}
        icon={<FileText className="h-6 w-6" />}
      />
      
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search summaries..."
              className="pl-8"
              value={searchQuery}
              onChange={handleSearchInput}
            />
          </div>
          <Link href="/dashboard/summaries/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Summary
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex h-[400px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredSummaries.length === 0 ? (
          <div className="flex h-[400px] flex-col items-center justify-center space-y-3 rounded-lg border border-dashed p-8 text-center">
            <FileOutput className="h-10 w-10 text-muted-foreground" />
            <div className="space-y-1">
              <h3 className="font-semibold">No summaries found</h3>
              {searchQuery ? (
                <p className="text-sm text-muted-foreground">
                  No summaries match your search criteria. Try a different search term.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  You haven&apos;t created any summaries yet.
                </p>
              )}
            </div>
            <Link href="/dashboard/summaries/new">
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Create your first summary
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredSummaries.map((summary) => (
              <Card key={summary.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="line-clamp-1">{summary.title}</CardTitle>
                  <CardDescription>
                    Created on {formatDate(summary.created_at)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="line-clamp-4 text-sm text-muted-foreground">
                    {summary.content}
                  </p>
                </CardContent>
                <CardFooter className="border-t p-4 flex justify-between">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/summaries/${summary.id}`}>
                      <BookOpen className="mr-2 h-4 w-4" />
                      View
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleCopySummary(summary)}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
} 