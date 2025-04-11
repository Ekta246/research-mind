import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bookmark, ExternalLink, FileText, TrendingUp } from "lucide-react"

// Sample data - in a real app, this would come from an API
const trendingPapers = [
  {
    id: "1",
    title: "Large Language Models in Scientific Discovery: Applications and Limitations",
    authors: "Anderson, K., Lee, S., Wang, H.",
    journal: "Science",
    year: 2023,
    abstract:
      "This paper examines how large language models are transforming scientific research across disciplines, while highlighting current technical and ethical limitations.",
    tags: ["AI", "LLM", "Scientific Discovery"],
    citations: 245,
    trend: "+32% this week",
  },
  {
    id: "2",
    title: "CRISPR-Cas9 Advances in Genetic Disease Treatment",
    authors: "Patel, R., Gupta, S., Kim, J.",
    journal: "Nature Biotechnology",
    year: 2023,
    abstract:
      "A review of recent clinical trials using CRISPR-Cas9 gene editing technology for treating previously incurable genetic disorders.",
    tags: ["CRISPR", "Gene Therapy", "Clinical Trials"],
    citations: 189,
    trend: "+28% this week",
  },
  {
    id: "3",
    title: "Sustainable Materials for Next-Generation Energy Storage",
    authors: "Nakamura, T., Singh, A., Müller, L.",
    journal: "Advanced Energy Materials",
    year: 2023,
    abstract:
      "This research presents novel sustainable materials for high-capacity batteries that reduce environmental impact while improving performance.",
    tags: ["Energy Storage", "Sustainable Materials", "Batteries"],
    citations: 156,
    trend: "+25% this week",
  },
]

export function TrendingPapers() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {trendingPapers.map((paper) => (
        <Card key={paper.id} className="flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="line-clamp-2">{paper.title}</CardTitle>
              <Badge className="ml-2 shrink-0" variant="secondary">
                <TrendingUp className="mr-1 h-3 w-3" />
                {paper.trend}
              </Badge>
            </div>
            <CardDescription>{paper.authors}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="text-sm text-muted-foreground mb-2">
              {paper.journal}, {paper.year} • {paper.citations} citations
            </div>
            <p className="text-sm line-clamp-3">{paper.abstract}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {paper.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <Button variant="outline" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Read
            </Button>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon">
                <Bookmark className="h-4 w-4" />
                <span className="sr-only">Save</span>
              </Button>
              <Button variant="ghost" size="icon">
                <ExternalLink className="h-4 w-4" />
                <span className="sr-only">Open</span>
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
