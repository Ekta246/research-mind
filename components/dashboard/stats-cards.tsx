// "use client"

// import { useState, useEffect } from "react"
// import { Card } from "@/components/ui/card"
// import { BookOpen, FolderKanban, FileText, Clock } from "lucide-react"
// import { useToast } from "@/components/ui/use-toast"

// interface StatsData {
//   papers: number
//   projects: number
//   summaries: number
//   readingTime: number
// }

// export function StatsCards() {
//   const [stats, setStats] = useState<StatsData>({
//     papers: 0,
//     projects: 0,
//     summaries: 0,
//     readingTime: 2, // Default reading time in hours
//   })
//   const [isLoading, setIsLoading] = useState(true)
//   const { toast } = useToast()

//   useEffect(() => {
//     const fetchStats = async () => {
//       setIsLoading(true)
//       try {
//         // Fetch papers count
//         const papersResponse = await fetch('/api/papers/list?limit=1')
//         const papersData = await papersResponse.json()
        
//         // Fetch projects count
//         const projectsResponse = await fetch('/api/projects')
//         const projectsData = await projectsResponse.json()
        
//         // Fetch summaries count
//         const summariesResponse = await fetch('/api/summaries/count')
        
//         let summariesCount = 0
//         if (summariesResponse.ok) {
//           const summariesData = await summariesResponse.json()
//           summariesCount = summariesData.count || 0
//         }
        
//         setStats({
//           papers: papersData.total || 0,
//           projects: projectsData.total || 0,
//           summaries: summariesCount,
//           readingTime: 2, // Default reading time in hours
//         })
//       } catch (error) {
//         console.error('Error fetching dashboard stats:', error)
//         toast({
//           title: "Failed to load statistics",
//           description: "Could not retrieve your research statistics",
//           variant: "destructive"
//         })
//       } finally {
//         setIsLoading(false)
//       }
//     }
    
//     fetchStats()
//   }, [toast])

//   return (
//     <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//       <StatsCard 
//         title="Papers" 
//         value={stats.papers} 
//         description="Total papers in your library" 
//         icon={<BookOpen className="h-5 w-5 text-blue-500" />}
//         isLoading={isLoading}
//       />
//       <StatsCard 
//         title="Projects" 
//         value={stats.projects} 
//         description="Active research projects" 
//         icon={<FolderKanban className="h-5 w-5 text-green-500" />}
//         isLoading={isLoading}
//       />
//       <StatsCard 
//         title="Summaries" 
//         value={stats.summaries} 
//         description="AI-generated summaries" 
//         icon={<FileText className="h-5 w-5 text-purple-500" />}
//         isLoading={isLoading}
//       />
//       <StatsCard 
//         title="Reading Time" 
//         value={stats.readingTime} 
//         description="Saved this month" 
//         icon={<Clock className="h-5 w-5 text-amber-500" />}
//         suffix="h"
//         isLoading={isLoading}
//       />
//     </div>
//   )
// }

// interface StatsCardProps {
//   title: string
//   value: number
//   description: string
//   icon: React.ReactNode
//   suffix?: string
//   isLoading: boolean
// }

// function StatsCard({ title, value, description, icon, suffix = "", isLoading }: StatsCardProps) {
//   return (
//     <Card className="p-4">
//       <div className="flex items-center gap-2">
//         <div className="p-2 bg-primary/10 rounded-full">
//           {icon}
//         </div>
//         <h3 className="text-sm font-medium">{title}</h3>
//       </div>
//       <div className="mt-3">
//         <div className="text-2xl font-bold">
//           {isLoading ? (
//             <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
//           ) : (
//             <>
//               {value}{suffix}
//             </>
//           )}
//         </div>
//         <p className="text-xs text-muted-foreground">{description}</p>
//       </div>
//     </Card>
//   )
// } 





"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, FileText, FolderKanban, Clock } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/components/ui/use-toast"

interface StatsData {
  paperCount: number
  projectCount: number
  summaryCount: number
  readingTimeSaved: number // in hours
}

export function ResearchStats() {
  const [stats, setStats] = useState<StatsData>({
    paperCount: 0,
    projectCount: 0,
    summaryCount: 0,
    readingTimeSaved: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()

  // Initial fetch of stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!supabase) return

      try {
        setIsLoading(true)

        // Get user ID
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        // Fetch paper count
        const { count: paperCount, error: paperError } = await supabase
          .from("papers")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)

        // Fetch project count
        const { count: projectCount, error: projectError } = await supabase
          .from("projects")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)

        // Fetch summary count
        const { count: summaryCount, error: summaryError } = await supabase
          .from("summaries")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)

        // Calculate reading time saved (5 minutes per paper + 15 minutes per summary)
        const readingTimeSaved = ((paperCount || 0) * 5 + (summaryCount || 0) * 15) / 60

        if (paperError || projectError || summaryError) {
          throw new Error("Error fetching stats")
        }

        setStats({
          paperCount: paperCount || 0,
          projectCount: projectCount || 0,
          summaryCount: summaryCount || 0,
          readingTimeSaved: Math.round(readingTimeSaved * 10) / 10, // Round to 1 decimal place
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
        toast({
          title: "Error loading statistics",
          description: "Failed to load your research statistics",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [supabase, toast])

  // Set up real-time listeners for updates
  useEffect(() => {
    if (!supabase) return

    const setupSubscriptions = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Subscribe to papers table changes
      const papersSubscription = supabase
        .channel("papers-changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "papers", filter: `user_id=eq.${user.id}` },
          () => {
            // Refresh stats when papers change
            fetchLatestStats()
          },
        )
        .subscribe()

      // Subscribe to projects table changes
      const projectsSubscription = supabase
        .channel("projects-changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "projects", filter: `user_id=eq.${user.id}` },
          () => {
            // Refresh stats when projects change
            fetchLatestStats()
          },
        )
        .subscribe()

      // Subscribe to summaries table changes
      const summariesSubscription = supabase
        .channel("summaries-changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "summaries", filter: `user_id=eq.${user.id}` },
          () => {
            // Refresh stats when summaries change
            fetchLatestStats()
          },
        )
        .subscribe()

      // Cleanup function to remove subscriptions
      return () => {
        papersSubscription.unsubscribe()
        projectsSubscription.unsubscribe()
        summariesSubscription.unsubscribe()
      }
    }

    const unsubscribe = setupSubscriptions()

    // Cleanup function
    return () => {
      unsubscribe.then((cleanup) => cleanup && cleanup())
    }
  }, [supabase])

  // Function to fetch latest stats (used by real-time listeners)
  const fetchLatestStats = async () => {
    if (!supabase) return

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Fetch updated counts
      const { count: paperCount } = await supabase
        .from("papers")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)

      const { count: projectCount } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)

      const { count: summaryCount } = await supabase
        .from("summaries")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)

      // Calculate reading time saved
      const readingTimeSaved = ((paperCount || 0) * 5 + (summaryCount || 0) * 15) / 60

      setStats({
        paperCount: paperCount || 0,
        projectCount: projectCount || 0,
        summaryCount: summaryCount || 0,
        readingTimeSaved: Math.round(readingTimeSaved * 10) / 10,
      })
    } catch (error) {
      console.error("Error updating stats:", error)
    }
  }

  // Define the stats cards data
  const statsCards = [
    {
      title: "Papers",
      value: isLoading ? "..." : stats.paperCount.toString(),
      description: "Total papers in your library",
      icon: <BookOpen className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: "Projects",
      value: isLoading ? "..." : stats.projectCount.toString(),
      description: "Active research projects",
      icon: <FolderKanban className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: "Summaries",
      value: isLoading ? "..." : stats.summaryCount.toString(),
      description: "AI-generated summaries",
      icon: <FileText className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: "Reading Time",
      value: isLoading ? "..." : `${stats.readingTimeSaved}h`,
      description: "Saved this month",
      icon: <Clock className="h-5 w-5 text-muted-foreground" />,
    },
  ]

  return (
    <>
      {statsCards.map((stat, index) => (
        <Card key={index} className={isLoading ? "animate-pulse" : ""}>
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
