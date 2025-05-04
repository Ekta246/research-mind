"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { FolderOpen, FolderPlus, Search, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

interface Project {
  id: string
  name: string
  description: string | null
  created_at: string
  // Additional properties might be available depending on your database schema
  paper_count?: number
}

export default function ProjectsPage() {
  const { toast } = useToast()
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProjects(projects)
    } else {
      const lowercaseQuery = searchQuery.toLowerCase()
      setFilteredProjects(
        projects.filter(
          project => 
            project.name.toLowerCase().includes(lowercaseQuery) || 
            (project.description && project.description.toLowerCase().includes(lowercaseQuery))
        )
      )
    }
  }, [searchQuery, projects])

  const fetchProjects = async () => {
    setIsLoading(true)
    console.log("Fetching projects..."); // Development log
    
    try {
      const response = await fetch("/api/projects")
      console.log("API response status:", response.status); // Development log
      
      if (!response.ok) {
        throw new Error("Failed to fetch projects")
      }
      
      const data = await response.json()
      console.log("API response data:", data); // Development log
      
      setProjects(data.projects || [])
      setFilteredProjects(data.projects || [])
    } catch (error) {
      console.error("Error fetching projects:", error)
      toast({
        title: "Failed to load projects",
        description: "Could not retrieve your projects. Please try again later.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    } catch (e) {
      console.error("Error formatting date:", e, "Date string was:", dateString); // Development log
      return dateString
    }
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Research Projects</h1>
          <p className="text-muted-foreground">
            Organize your research papers and findings into projects.
          </p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      <div className="flex w-full max-w-lg items-center space-x-2">
        <Input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9"
        />
        <Button type="submit" size="sm" className="h-9 px-3">
          <Search className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-full max-w-[250px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            {searchQuery ? (
              <>
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No matching projects found</h3>
                <p className="text-muted-foreground">
                  Try a different search term or clear your search.
                </p>
              </>
            ) : (
              <>
                <FolderPlus className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No projects yet</h3>
                <p className="text-muted-foreground">
                  Create your first research project to get started.
                </p>
                <Link href="/dashboard/projects/new" className="mt-4">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Project
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{project.name}</CardTitle>
                {project.description && (
                  <CardDescription className="line-clamp-2">
                    {project.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    {project.paper_count !== undefined && (
                      <Badge variant="outline" className="mr-2">
                        {project.paper_count} papers
                      </Badge>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Created {formatDate(project.created_at)}
                    </p>
                  </div>
                  <Link href={`/dashboard/projects/${project.id}`}>
                    <Button variant="outline" size="icon">
                      <FolderOpen className="h-4 w-4" />
                      <span className="sr-only">Open project</span>
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