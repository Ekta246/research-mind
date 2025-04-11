import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bookmark, ExternalLink, FileText } from "lucide-react"

// Sample data - in a real app, this would come from an API
const recentPapers = [
  {
    id: "1",
    title: "Advances in Natural Language Processing for Scientific Research",
    authors: "Zhang, J., Smith, A., Johnson, B.",
    journal: "Journal of Computational Linguistics",
    year: 2023,
    abstract:
      "This paper explores recent advances in NLP techniques applied to scientific literature, focusing on information extraction and knowledge graph construction.",
    tags: ["NLP", "Machine Learning", "Information Extraction"],
    dateAdded: "2023-12-15",
  },
  {
    id: "2",
    title: "Quantum Computing Applications in Drug Discovery",
    authors: "Brown, R., Davis, M., Wilson, E.",
    journal: "Nature Quantum Information",
    year: 2023,
    abstract:
      "A comprehensive review of how quantum computing algorithms are accelerating the drug discovery process through improved molecular modeling.",
    tags: ["Quantum Computing", "Drug Discovery", "Molecular Modeling"],
    dateAdded: "2023-12-10",
  },
  {
    id: "3",
    title: "Climate Change Impact on Biodiversity: A Meta-Analysis",
    authors: "Garcia, L., Martinez, P., Thompson, S.",
    journal: "Environmental Science & Technology",
    year: 2023,
    abstract:
      "This meta-analysis examines over 500 studies to quantify the impact of climate change on global biodiversity across different ecosystems.",
    tags: ["Climate Change", "Biodiversity", "Meta-Analysis"],
    dateAdded: "2023-12-05",
  },
]

export function RecentPapers() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {recentPapers.map((paper) => (
        <Card key={paper.id} className="flex flex-col">
          <CardHeader>
            <CardTitle className="line-clamp-2">{paper.title}</CardTitle>
            <CardDescription>{paper.authors}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="text-sm text-muted-foreground mb-2">
              {paper.journal}, {paper.year}
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
