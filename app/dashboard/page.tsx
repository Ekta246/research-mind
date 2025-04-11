import { Suspense } from "react"
// Skip authentication for now
// import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RecentPapers } from "@/components/dashboard/recent-papers"
import { RecentProjects } from "@/components/dashboard/recent-projects"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { ResearchStats } from "@/components/dashboard/research-stats"
import { WelcomeBanner } from "@/components/dashboard/welcome-banner"
import { LoadingIndicator } from "@/components/ui/loading-indicator"
import { redirect } from "next/navigation"
import type { User } from "@supabase/supabase-js"

export default async function DashboardPage() {
  // TEMPORARY: Create mock user for development
  const mockUser: User = {
    id: 'dev-user-123',
    email: 'dev@example.com',
    user_metadata: { full_name: 'Dev User' },
    app_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    role: '',
    confirmed_at: new Date().toISOString()
  } as User

  return (
    <div className="flex flex-col gap-6">
      <WelcomeBanner user={mockUser} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<LoadingIndicator text="Loading stats..." />}>
          <ResearchStats />
        </Suspense>
      </div>

      <div className="grid gap-6 md:grid-cols-6">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your recent research papers and activities</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="papers">
              <TabsList className="mb-4">
                <TabsTrigger value="papers">Papers</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
              </TabsList>
              <TabsContent value="papers">
                <Suspense fallback={<LoadingIndicator text="Loading papers..." />}>
                  <RecentPapers />
                </Suspense>
              </TabsContent>
              <TabsContent value="projects">
                <Suspense fallback={<LoadingIndicator text="Loading projects..." />}>
                  <RecentProjects />
                </Suspense>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<LoadingIndicator text="Loading actions..." />}>
              <QuickActions />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
