"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Edit, Trash, Plus, BookOpen } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface Project {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

interface ProjectPaper {
  id: string
  title: string
  authors: string[]
  abstract: string
}

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [project, setProject] = useState<Project | null>(null)
  const [papers, setPapers] = useState<ProjectPaper[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchProjectDetails()
  }, [params.id])

  const fetchProjectDetails = async () => {
    setIsLoading(true)
    console.log("Fetching project details for ID:", params.id); // Development log
    
    try {
      // For development, simulate fetching project details
      // In production, you would call an API endpoint
      
      // Simulate API call to get project details
      setTimeout(() => {
        // This is mock data - in production, you would fetch from your API
        const mockProject = {
          id: params.id,
          name: "Research Project " + params.id,
          description: "This is a sample research project for development testing.",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        // Mock papers associated with this project
        const mockPapers = [
          {
            id: "paper1",
            title: "Understanding Deep Learning Requires Rethinking Generalization",
            authors: ["Zhang, C.", "Bengio, S.", "Hardt, M."],
            abstract: "Despite their massive size, deep neural networks can generalize well..."
          },
          {
            id: "paper2",
            title: "Attention Is All You Need",
            authors: ["Vaswani, A.", "Shazeer, N.", "Parmar, N."],
            abstract: "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks..."
          }
        ]
        
        setProject(mockProject)
        setPapers(mockPapers)
        setIsLoading(false)
      }, 1000) // Simulate network delay
      
    } catch (error) {
      console.error("Error fetching project details:", error)
      toast({
        title: "Failed to load project",
        description: "Could not retrieve project details. Please try again later.",
        variant: "destructive"
      })
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    } catch (e) {
      return dateString
    }
  }

  if (isLoading) {
    return (
      <div className="container py-6 space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-full max-w-[300px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-32 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="container py-6">
        <div className="flex flex-col items-center justify-center text-center py-12">
          <h2 className="text-2xl font-bold">Project Not Found</h2>
          <p className="text-muted-foreground mt-2">The project you're looking for doesn't exist or has been removed.</p>
          <Link href="/dashboard/projects" className="mt-4">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => router.push('/dashboard/projects')}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
            <p className="text-sm text-muted-foreground">
              Created {formatDate(project.created_at)}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" size="sm">
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {project.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{project.description}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Papers in this Project</h2>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Paper
        </Button>
      </div>

      {papers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No papers yet</h3>
            <p className="text-muted-foreground">
              Add papers to this project to organize your research.
            </p>
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add Paper
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {papers.map((paper) => (
            <Card key={paper.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{paper.title}</CardTitle>
                <CardDescription>
                  {paper.authors.join(", ")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {paper.abstract}
                </p>
                <div className="mt-4 flex justify-end">
                  <Link href={`/dashboard/papers/${paper.id}`}>
                    <Button variant="outline" size="sm">
                      <BookOpen className="mr-2 h-4 w-4" />
                      View Paper
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 