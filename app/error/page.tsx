"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Home } from "lucide-react"

export default function ErrorPage() {
  const searchParams = useSearchParams()
  const errorMessage = searchParams.get("message") || "An unexpected error occurred"

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <AlertTriangle className="h-16 w-16 text-destructive mb-6" />
      <h1 className="text-3xl font-bold mb-2">Something went wrong</h1>
      <p className="text-muted-foreground mb-8 max-w-md">{errorMessage}</p>

      <div className="space-y-4">
        <Button onClick={() => window.location.reload()}>Try again</Button>
        <div>
          <Link href="/">
            <Button variant="outline" className="mt-2">
              <Home className="mr-2 h-4 w-4" />
              Return to home
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-12 max-w-lg">
        <h2 className="text-lg font-semibold mb-2">Troubleshooting</h2>
        <ul className="text-sm text-muted-foreground text-left space-y-2">
          <li>• Check if your Supabase project is active</li>
          <li>• Verify your environment variables are correctly set</li>
          <li>• Make sure your network connection is stable</li>
          <li>• Clear your browser cache and cookies</li>
          <li>• Contact support if the problem persists</li>
        </ul>
      </div>
    </div>
  )
}
