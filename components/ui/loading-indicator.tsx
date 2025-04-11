"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingIndicatorProps {
  variant?: "spinner" | "bar" | "magnify" | "pulse"
  text?: string
  className?: string
}

export function LoadingIndicator({ variant = "bar", text = "Searching papers...", className }: LoadingIndicatorProps) {
  const [progress, setProgress] = useState(0)

  // Simulate progress for the loading bar
  useEffect(() => {
    if (variant !== "bar") return

    const interval = setInterval(() => {
      setProgress((prev) => {
        // Slow down as it approaches 100%
        const increment = Math.max(1, 10 * (1 - prev / 100))
        const newProgress = Math.min(95, prev + increment)
        return newProgress
      })
    }, 300)

    return () => clearInterval(interval)
  }, [variant])

  // Complete the progress when component is about to unmount
  useEffect(() => {
    return () => {
      if (variant === "bar") {
        setProgress(100)
      }
    }
  }, [variant])

  if (variant === "bar") {
    return (
      <div className={`w-full flex flex-col items-center space-y-2 ${className}`}>
        <div className="w-full max-w-xs bg-muted rounded-full h-2.5 overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-progress-bar"></div>
        </div>
        {text && <p className="text-sm text-muted-foreground">{text}</p>}
      </div>
    )
  }

  if (variant === "magnify") {
    return (
      <div className={cn("flex flex-col items-center justify-center space-y-4 py-8", className)}>
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
          <div className="relative animate-bounce">
            <Search className="h-12 w-12 text-primary" />
          </div>
        </div>
        <p className="text-center text-muted-foreground">{text}</p>
      </div>
    )
  }

  // Pulse variant (simple pulsing dots)
  return (
    <div className={cn("flex flex-col items-center justify-center space-y-4 py-8", className)}>
      <div className="flex space-x-2">
        <div className="h-3 w-3 animate-pulse rounded-full bg-primary" />
        <div className="h-3 w-3 animate-pulse rounded-full bg-primary delay-150" style={{ animationDelay: "0.3s" }} />
        <div className="h-3 w-3 animate-pulse rounded-full bg-primary delay-300" style={{ animationDelay: "0.6s" }} />
      </div>
      <p className="text-center text-muted-foreground">{text}</p>
    </div>
  )
}
