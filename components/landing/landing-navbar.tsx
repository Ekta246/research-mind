"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Menu, X } from "lucide-react"

export function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  // Remove the Supabase check from client component to avoid errors
  const isSupabaseReady = true

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-primary">ResearchMind</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
            Features
          </Link>
          <Link href="#demo" className="text-sm font-medium hover:text-primary transition-colors">
            Demo
          </Link>
          <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
            Pricing
          </Link>
          <div className="flex items-center space-x-2">
            <Link href="/signin">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Sign Up</Button>
            </Link>
            <ModeToggle />
          </div>
        </nav>

        {/* Mobile Navigation Toggle */}
        <div className="flex items-center md:hidden space-x-2">
          <ModeToggle />
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle Menu">
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="container md:hidden py-4 animate-fade-in">
          <nav className="flex flex-col space-y-4">
            <Link
              href="#features"
              className="text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="#demo"
              className="text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Demo
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </Link>
            <div className="flex flex-col space-y-2 pt-2 border-t">
              <Link href="/signin">
                <Button variant="outline" className="w-full" onClick={() => setIsMenuOpen(false)}>
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="w-full" onClick={() => setIsMenuOpen(false)}>
                  Sign Up
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
