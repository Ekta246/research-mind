"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Home,
  Search,
  FileText,
  FolderKanban,
  MessageSquare,
  BookOpen,
  Upload,
  History,
  Bookmark,
  Menu,
  X,
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <Home className="h-5 w-5" />,
  },
  {
    title: "Search Papers",
    href: "/dashboard/search",
    icon: <Search className="h-5 w-5" />,
  },
  {
    title: "My Library",
    href: "/dashboard/library",
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    title: "Projects",
    href: "/dashboard/projects",
    icon: <FolderKanban className="h-5 w-5" />,
  },
  {
    title: "AI Chat",
    href: "/dashboard/chat",
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    title: "Upload Papers",
    href: "/dashboard/upload",
    icon: <Upload className="h-5 w-5" />,
  },
  {
    title: "Summaries",
    href: "/dashboard/summaries",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: "History",
    href: "/dashboard/history",
    icon: <History className="h-5 w-5" />,
  },
  {
    title: "Bookmarks",
    href: "/dashboard/bookmarks",
    icon: <Bookmark className="h-5 w-5" />,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile sidebar toggle */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-40 rounded-full shadow-lg md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        <span className="sr-only">Toggle Sidebar</span>
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 border-r bg-background transition-transform duration-300 md:sticky md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="font-bold text-primary">ResearchMind</span>
          </Link>
        </div>
        <ScrollArea className="h-[calc(100vh-3.5rem)]">
          <div className="px-3 py-4">
            <nav className="flex flex-col space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    pathname === item.href ? "bg-accent text-accent-foreground" : "transparent",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon}
                  <span className="ml-3">{item.title}</span>
                </Link>
              ))}
            </nav>
          </div>
        </ScrollArea>
      </aside>
    </>
  )
}
