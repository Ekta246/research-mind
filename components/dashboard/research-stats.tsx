import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, FileText, FolderKanban, Clock } from "lucide-react"
// Skip authentication for development
// import { createClient } from "@/utils/supabase/server"
// import { getAuthUser } from "@/utils/supabase/server"

export async function ResearchStats() {
  // TEMPORARY: Use mock data for development
  const stats = [
    {
      title: "Papers",
      value: "0",
      description: "Total papers in your library",
      icon: <BookOpen className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: "Projects",
      value: "0",
      description: "Active research projects",
      icon: <FolderKanban className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: "Summaries",
      value: "0",
      description: "AI-generated summaries",
      icon: <FileText className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: "Reading Time",
      value: "2h",
      description: "Saved this month",
      icon: <Clock className="h-5 w-5 text-muted-foreground" />,
    },
  ]

  return (
    <>
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </>
  )
}
