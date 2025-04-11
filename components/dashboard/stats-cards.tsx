"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { BookOpen, FolderKanban, FileText, Clock } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface StatsData {
  papers: number
  projects: number
  summaries: number
  readingTime: number
}

export function StatsCards() {
  const [stats, setStats] = useState<StatsData>({
    papers: 0,
    projects: 0,
    summaries: 0,
    readingTime: 2, // Default reading time in hours
  })
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true)
      try {
        // Fetch papers count
        const papersResponse = await fetch('/api/papers/list?limit=1')
        const papersData = await papersResponse.json()
        
        // Fetch projects count
        const projectsResponse = await fetch('/api/projects')
        const projectsData = await projectsResponse.json()
        
        // Fetch summaries count
        const summariesResponse = await fetch('/api/summaries/count')
        
        let summariesCount = 0
        if (summariesResponse.ok) {
          const summariesData = await summariesResponse.json()
          summariesCount = summariesData.count || 0
        }
        
        setStats({
          papers: papersData.total || 0,
          projects: projectsData.total || 0,
          summaries: summariesCount,
          readingTime: 2, // Default reading time in hours
        })
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        toast({
          title: "Failed to load statistics",
          description: "Could not retrieve your research statistics",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchStats()
  }, [toast])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard 
        title="Papers" 
        value={stats.papers} 
        description="Total papers in your library" 
        icon={<BookOpen className="h-5 w-5 text-blue-500" />}
        isLoading={isLoading}
      />
      <StatsCard 
        title="Projects" 
        value={stats.projects} 
        description="Active research projects" 
        icon={<FolderKanban className="h-5 w-5 text-green-500" />}
        isLoading={isLoading}
      />
      <StatsCard 
        title="Summaries" 
        value={stats.summaries} 
        description="AI-generated summaries" 
        icon={<FileText className="h-5 w-5 text-purple-500" />}
        isLoading={isLoading}
      />
      <StatsCard 
        title="Reading Time" 
        value={stats.readingTime} 
        description="Saved this month" 
        icon={<Clock className="h-5 w-5 text-amber-500" />}
        suffix="h"
        isLoading={isLoading}
      />
    </div>
  )
}

interface StatsCardProps {
  title: string
  value: number
  description: string
  icon: React.ReactNode
  suffix?: string
  isLoading: boolean
}

function StatsCard({ title, value, description, icon, suffix = "", isLoading }: StatsCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-primary/10 rounded-full">
          {icon}
        </div>
        <h3 className="text-sm font-medium">{title}</h3>
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold">
          {isLoading ? (
            <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
          ) : (
            <>
              {value}{suffix}
            </>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </Card>
  )
} 