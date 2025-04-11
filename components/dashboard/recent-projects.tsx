import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FolderOpen, Plus } from "lucide-react"
// Skip authentication for development
// import { createClient } from "@/utils/supabase/server"
// import { getAuthUser } from "@/utils/supabase/server"

export async function RecentProjects() {
  // TEMPORARY: Use mock data for development
  const mockProjects = [
    {
      id: "1",
      name: "Literature Review: AI in Healthcare",
      description: "Exploring the applications of AI in modern healthcare systems",
      paperCount: 8,
      updatedAt: "Monday, January 15, 2024"
    },
    {
      id: "2",
      name: "Quantum Computing Research",
      description: "Investigating quantum algorithms and their applications",
      paperCount: 5,
      updatedAt: "Friday, January 12, 2024"
    },
    {
      id: "3",
      name: "Climate Change Meta-Analysis",
      description: "Analyzing research on climate change impacts across ecosystems",
      paperCount: 12,
      updatedAt: "Tuesday, January 9, 2024"
    }
  ]

  return (
    <div className="space-y-4">
      {mockProjects.map((project) => (
        <div key={project.id} className="flex flex-col space-y-2 rounded-lg border p-4 hover:bg-muted/50">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold">{project.name}</h3>
              <p className="text-sm text-muted-foreground">{project.description}</p>
              <div className="mt-2 flex items-center text-xs text-muted-foreground">
                <Badge variant="outline" className="mr-2">
                  {project.paperCount} papers
                </Badge>
                Updated {project.updatedAt}
              </div>
            </div>
            <Link href={`/dashboard/projects/${project.id}`}>
              <Button variant="ghost" size="icon">
                <FolderOpen className="h-4 w-4" />
                <span className="sr-only">Open project</span>
              </Button>
            </Link>
          </div>
        </div>
      ))}

      <Link href="/dashboard/projects/new">
        <Button variant="outline" className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Create new project
        </Button>
      </Link>
    </div>
  )
}
