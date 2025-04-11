import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bookmark, ExternalLink, FileText } from "lucide-react"

// Sample search results - in a real app, this would come from an API based on the query
const generateSearchResults = (query: string) => {
  // This is just a simple mock that would be replaced with actual search functionality
  return [
    {
      id: "sr1",
      title: `Recent Advances in ${query} Research`,
      authors: "Johnson, A., Williams, B., Davis, C.",
      journal: "Journal of Advanced Research",
      year: 2023,
      abstract: `This comprehensive review examines the latest developments in ${query} research, highlighting key breakthroughs and future directions.`,
      tags: [query, "Review", "Research Trends"],
      relevance: "98% match",
    },
    {
      id: "sr2",
      title: `Applications of Machine Learning in ${query}`,
      authors: "Smith, R., Brown, T., Garcia, M.",
      journal: "Computational Science Journal",
      year: 2022,
      abstract: `This paper explores how machine learning techniques can be applied to solve complex problems in ${query}, with case studies and experimental results.`,
      tags: ["Machine Learning", query, "Applications"],
      relevance: "92% match",
    },
    {
      id: "sr3",
      title: `Theoretical Foundations of ${query}`,
      authors: "Lee, J., Chen, H., Kumar, P.",
      journal: "Theoretical Studies",
      year: 2021,
      abstract: `An in-depth analysis of the theoretical principles underlying ${query}, providing mathematical models and conceptual frameworks.`,
      tags: ["Theory", query, "Foundations"],
      relevance: "85% match",
    },
  ]
}

export function SearchResults({ query }: { query: string }) {
  const results = generateSearchResults(query)

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-medium">
          Search results for: <span className="font-bold">"{query}"</span>
        </h3>
        <p className="text-sm text-muted-foreground">Found {results.length} papers</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {results.map((paper) => (
          <Card key={paper.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="line-clamp-2">{paper.title}</CardTitle>
                <Badge className="ml-2 shrink-0">{paper.relevance}</Badge>
              </div>
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
    </div>
  )
}
