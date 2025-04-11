"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function HeroSection() {
  const [typedText, setTypedText] = useState("")
  const fullText = "Discover. Analyze. Synthesize."

  useEffect(() => {
    let index = 0
    const timer = setInterval(() => {
      setTypedText(fullText.substring(0, index))
      index++
      if (index > fullText.length) {
        clearInterval(timer)
      }
    }, 100)

    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-light/50 to-transparent -z-10" />

      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-light rounded-full blur-3xl opacity-30 animate-pulse-slow" />
        <div
          className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-brand-light rounded-full blur-3xl opacity-20 animate-pulse-slow"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-8 md:space-y-12">
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
              Your AI Research Assistant for Academic Excellence
            </h1>
            <p className="text-xl md:text-2xl font-medium text-primary h-8">
              {typedText}
              <span className="animate-pulse">|</span>
            </p>
            <p className="text-muted-foreground md:text-lg max-w-2xl mx-auto">
              ResearchMind helps you find, analyze, and synthesize research papers, saving you hours of work and helping
              you produce better academic results.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button size="lg" variant="outline" className="gap-2">
                See Demo <Sparkles className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 pt-8">
            <div className="flex flex-col items-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">10M+</div>
              <div className="text-sm text-muted-foreground">Research Papers</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">85%</div>
              <div className="text-sm text-muted-foreground">Time Saved</div>
            </div>
            <div className="flex flex-col items-center col-span-2 md:col-span-1">
              <div className="text-3xl md:text-4xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">AI Assistance</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
