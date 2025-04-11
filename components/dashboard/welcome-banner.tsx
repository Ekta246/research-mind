"use client"

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useState } from "react"
import type { User } from "@supabase/supabase-js"

interface WelcomeBannerProps {
  user: User | null
}

export function WelcomeBanner({ user }: WelcomeBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  // Extract username from email or use a default
  const username = user?.email ? user.email.split("@")[0] : "Researcher"

  return (
    <div className="relative rounded-lg border bg-card p-6 shadow-sm">
      <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={() => setIsVisible(false)}>
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </Button>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome to ResearchMind{user?.email ? `, ${user.email.split("@")[0]}` : ""}!
        </h1>
        <p className="text-muted-foreground">
          Your AI-powered research assistant is ready to help you discover, analyze, and synthesize academic papers.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            Take a tour
          </Button>
          <Button variant="outline" size="sm">
            Watch tutorial
          </Button>
        </div>
      </div>
    </div>
  )
}
