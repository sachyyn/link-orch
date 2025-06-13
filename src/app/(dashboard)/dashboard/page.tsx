import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { DashboardHeader } from "@/components/layouts/dashboard-header"
import { Button } from "@/components/ui/button"
import { 
  TrendingUp, 
  Users, 
  Eye, 
  FileText,
  Calendar,
  Target,
  BarChart3,
  Plus
} from "lucide-react"

export default async function DashboardPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/')
  }

  return (
    <div className="flex h-screen flex-col">
      <DashboardHeader 
        title="Dashboard" 
        description="Welcome back to LinkedinMaster Pro"
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Action Bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-medium">Get started with your LinkedIn strategy</h2>
            <p className="text-sm text-muted-foreground">Create content, analyze performance, and grow your network</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Post
          </Button>
        </div>

        {/* Quick Stats - Clean Row Layout */}
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-4">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-4 border-t border-b">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Posts This Month</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Total Engagement</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Profile Views</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">New Connections</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Clean Grid */}
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2 justify-center">
              <FileText className="h-5 w-5" />
              <span className="text-sm">Create Post</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col gap-2 justify-center">
              <Calendar className="h-5 w-5" />
              <span className="text-sm">Schedule Content</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col gap-2 justify-center">
              <Target className="h-5 w-5" />
              <span className="text-sm">Create Event</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col gap-2 justify-center">
              <BarChart3 className="h-5 w-5" />
              <span className="text-sm">View Analytics</span>
            </Button>
          </div>
        </div>

        {/* Getting Started - Clean List */}
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-4">Getting Started</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-4 border-b last:border-b-0">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-muted rounded-lg">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-medium">Create Your First Post</h3>
                  <p className="text-sm text-muted-foreground">Start building your LinkedIn presence with engaging content</p>
                </div>
              </div>
              <Button size="sm">Get Started</Button>
            </div>
            
            <div className="flex items-center justify-between py-4 border-b last:border-b-0">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-muted rounded-lg">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-medium">Setup Content Calendar</h3>
                  <p className="text-sm text-muted-foreground">Plan and schedule your content for consistent posting</p>
                </div>
              </div>
              <Button size="sm" variant="outline">Setup</Button>
            </div>
            
            <div className="flex items-center justify-between py-4 border-b last:border-b-0">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-muted rounded-lg">
                  <Target className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-medium">Define Content Pillars</h3>
                  <p className="text-sm text-muted-foreground">Organize your content strategy around key topics</p>
                </div>
              </div>
              <Button size="sm" variant="outline">Create</Button>
            </div>
            
            <div className="flex items-center justify-between py-4 border-b last:border-b-0">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-muted rounded-lg">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-medium">Track Analytics</h3>
                  <p className="text-sm text-muted-foreground">Monitor your LinkedIn performance and engagement</p>
                </div>
              </div>
              <Button size="sm" variant="outline">View</Button>
            </div>
          </div>
        </div>

        {/* Recent Activity - Clean Timeline */}
        <div>
          <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
          <div className="border-l-2 border-muted pl-6 space-y-6">
            <div className="relative">
              <div className="absolute -left-8 w-3 h-3 bg-primary rounded-full border-2 border-background"></div>
              <div>
                <h3 className="font-medium">Welcome to LinkedinMaster Pro!</h3>
                <p className="text-sm text-muted-foreground">Account created successfully</p>
                <p className="text-xs text-muted-foreground mt-1">Just now</p>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -left-8 w-3 h-3 bg-muted rounded-full border-2 border-background"></div>
              <div>
                <h3 className="font-medium">Ready to get started</h3>
                <p className="text-sm text-muted-foreground">Complete your first post to begin tracking analytics</p>
                <p className="text-xs text-muted-foreground mt-1">Pending</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 