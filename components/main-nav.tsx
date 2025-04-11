import type React from "react"
import Link from "next/link"
import {
  Home,
  Search,
  FileText,
  Bookmark,
  History,
  Users,
  FileSpreadsheet,
  BarChart3,
  Settings,
  HelpCircle,
  TrendingUp,
  MessageSquare,
} from "lucide-react"

export function MainNav() {
  return (
    <div className="flex w-full items-center space-x-4 lg:space-x-6">
      <Link href="/" className="text-2xl font-bold">
        ResearchMind
      </Link>
      <div className="ml-auto flex items-center space-x-2">
        <NavItem href="/dashboard" icon={<Home className="h-5 w-5" />} label="Dashboard" />
        <NavItem href="/search" icon={<Search className="h-5 w-5" />} label="Search" />
        <NavItem href="/papers" icon={<FileText className="h-5 w-5" />} label="Papers" />
        <NavItem href="/saved" icon={<Bookmark className="h-5 w-5" />} label="Saved" />
        <NavItem href="/history" icon={<History className="h-5 w-5" />} label="History" />
        <NavItem href="/collaborators" icon={<Users className="h-5 w-5" />} label="Collaborators" />
        <NavItem href="/my-papers" icon={<FileSpreadsheet className="h-5 w-5" />} label="My Papers" />
        <NavItem href="/analytics" icon={<BarChart3 className="h-5 w-5" />} label="Analytics" />
        <NavItem href="/settings" icon={<Settings className="h-5 w-5" />} label="Settings" />
        <NavItem href="/help" icon={<HelpCircle className="h-5 w-5" />} label="Help & Support" />
        <NavItem href="/new-search" icon={<Search className="h-5 w-5" />} label="New Search" />
        <NavItem href="/chat" icon={<MessageSquare className="h-5 w-5" />} label="Chat" />
        <NavItem href="/trending" icon={<TrendingUp className="h-5 w-5" />} label="Trending" />
      </div>
    </div>
  )
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex h-10 w-10 items-center justify-center rounded-md border border-input bg-background text-sm font-medium hover:bg-accent hover:text-accent-foreground md:tooltip md:tooltip-bottom"
      data-tip={label}
    >
      {icon}
      <span className="sr-only">{label}</span>
    </Link>
  )
}
