"use client"

import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface MagnifyingAnimationProps {
  className?: string
  size?: "sm" | "md" | "lg"
  text?: string
}

export function MagnifyingAnimation({ className, size = "md", text = "Searching..." }: MagnifyingAnimationProps) {
  const [dots, setDots] = useState(".")

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return "."
        return prev + "."
      })
    }, 500)

    return () => clearInterval(interval)
  }, [])

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  }

  return (
    <div className={cn("flex flex-col items-center justify-center py-8", className)}>
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
        <div className="relative animate-float">
          <Search className={cn("text-primary", sizeClasses[size])} />
        </div>
        <div
          className="absolute -bottom-1 left-1/2 h-1 w-1 animate-bounce rounded-full bg-primary"
          style={{ animationDelay: "0.1s" }}
        />
        <div
          className="absolute -bottom-1 left-[calc(50%-10px)] h-1 w-1 animate-bounce rounded-full bg-primary"
          style={{ animationDelay: "0.3s" }}
        />
        <div
          className="absolute -bottom-1 left-[calc(50%+10px)] h-1 w-1 animate-bounce rounded-full bg-primary"
          style={{ animationDelay: "0.5s" }}
        />
      </div>
      <p className="mt-4 text-center text-muted-foreground">
        {text}
        {dots}
      </p>
    </div>
  )
}
