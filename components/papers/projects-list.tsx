"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { FolderPlus, Check } from "lucide-react"

interface Project {
  id: string
  name: string
  description: string | null
  created_at: string
}

interface Paper {
  id: string
  title: string
  url: string
  authors: string[]
  abstract: string
  is_favorite: boolean
}

interface ProjectsListProps {
  selectedPaper?: Paper | null
}

export function ProjectsList({ selectedPaper }: ProjectsListProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newProject, setNewProject] = useState({ name: "", description: "" })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [addingToProject, setAddingToProject] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/projects')
      if (!response.ok) throw new Error('Failed to fetch projects')
      const data = await response.json()
      setProjects(data.projects || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
      toast({
        title: "Failed to load projects",
        description: "Could not retrieve your projects",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const createProject = async () => {
    if (!newProject.name.trim()) {
      toast({
        title: "Project name required",
        description: "Please enter a name for your project",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject)
      })

      if (!response.ok) throw new Error('Failed to create project')
      
      await fetchProjects()
      setNewProject({ name: "", description: "" })
      setDialogOpen(false)
      toast({
        title: "Project created",
        description: "Your new project has been created successfully"
      })
    } catch (error) {
      console.error('Error creating project:', error)
      toast({
        title: "Failed to create project",
        description: "There was an error creating your project",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const addPaperToProject = async (projectId: string) => {
    if (!selectedPaper) return
    
    setAddingToProject(projectId)
    try {
      const response = await fetch(`/api/projects/${projectId}/papers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paperId: selectedPaper.id })
      })

      if (!response.ok) throw new Error('Failed to add paper to project')
      
      const data = await response.json()
      toast({
        title: "Paper added to project",
        description: data.message || "Paper successfully added to project"
      })
    } catch (error) {
      console.error('Error adding paper to project:', error)
      toast({
        title: "Failed to add paper",
        description: "There was an error adding the paper to the project",
        variant: "destructive"
      })
    } finally {
      setAddingToProject(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">My Projects</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <FolderPlus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Create a project to organize your research papers.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  placeholder="Enter project name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Enter project description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={createProject} 
                disabled={isSubmitting || !newProject.name.trim()}
              >
                {isSubmitting ? "Creating..." : "Create Project"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-100 animate-pulse rounded" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>You haven't created any projects yet.</p>
          <p className="text-sm">Create a project to organize your research papers.</p>
        </div>
      ) : (
        <Accordion type="multiple" className="w-full">
          {projects.map((project) => (
            <AccordionItem key={project.id} value={project.id}>
              <AccordionTrigger className="text-sm font-medium">
                {project.name}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 p-2">
                  {project.description && (
                    <p className="text-xs text-muted-foreground">{project.description}</p>
                  )}
                  {selectedPaper && (
                    <Button
                      size="sm"
                      variant="outline" 
                      className="w-full mt-2"
                      onClick={() => addPaperToProject(project.id)}
                      disabled={addingToProject === project.id}
                    >
                      {addingToProject === project.id ? (
                        <span className="flex items-center">
                          <Check className="h-4 w-4 mr-2" />
                          Added
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <FolderPlus className="h-4 w-4 mr-2" />
                          Add selected paper
                        </span>
                      )}
                    </Button>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  )
} 