import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search, Upload, MessageSquare, FolderPlus, FileText, BookOpen } from "lucide-react"
// Skip authentication for development
// import { getAuthUser } from "@/utils/supabase/server"

export async function QuickActions() {
  // TEMPORARY: Skip auth check for development
  // const user = await getAuthUser()
  // if (!user) return null

  const actions = [
    {
      title: "Search Papers",
      description: "Find relevant research",
      icon: <Search className="h-5 w-5" />,
      href: "/dashboard/search",
    },
    {
      title: "Upload PDF",
      description: "Add papers to your library",
      icon: <Upload className="h-5 w-5" />,
      href: "/dashboard/upload",
    },
    {
      title: "Ask AI Assistant",
      description: "Get research help",
      icon: <MessageSquare className="h-5 w-5" />,
      href: "/dashboard/chat",
    },
    {
      title: "Create Project",
      description: "Organize your research",
      icon: <FolderPlus className="h-5 w-5" />,
      href: "/dashboard/projects/new",
    },
    {
      title: "Generate Summary",
      description: "Summarize papers",
      icon: <FileText className="h-5 w-5" />,
      href: "/dashboard/summaries/new",
    },
    {
      title: "Browse Library",
      description: "View your papers",
      icon: <BookOpen className="h-5 w-5" />,
      href: "/dashboard/library",
    },
  ]

  return (
    <div className="grid gap-2">
      {actions.map((action) => (
        <Link key={action.title} href={action.href}>
          <Button variant="outline" className="h-auto w-full justify-start px-4 py-3">
            <div className="flex items-center">
              <div className="mr-3 rounded-md bg-primary/10 p-1">{action.icon}</div>
              <div className="text-left">
                <div className="font-medium">{action.title}</div>
                <div className="text-xs text-muted-foreground">{action.description}</div>
              </div>
            </div>
          </Button>
        </Link>
      ))}
    </div>
  )
}
