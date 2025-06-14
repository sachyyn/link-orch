'use client'

import { useDashboardStats } from '@/hooks/use-api'
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
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

export function DashboardContent() {
  const { data: stats, isLoading, error } = useDashboardStats()

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-8">
          {/* Action Bar Skeleton */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-80" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Stats Skeleton */}
          <div>
            <Skeleton className="h-6 w-24 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-4 border-t border-b">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Skeleton */}
          <div>
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-muted-foreground">
          <p>Failed to load dashboard data. Please try again.</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
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

      {/* Quick Stats - Using Real Data */}
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-4 border-t border-b">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.totalPosts || 0}</p>
              <p className="text-sm text-muted-foreground">Total Posts</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.publishedPosts || 0}</p>
              <p className="text-sm text-muted-foreground">Published Posts</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.scheduledPosts || 0}</p>
              <p className="text-sm text-muted-foreground">Scheduled Posts</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Eye className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.draftPosts || 0}</p>
              <p className="text-sm text-muted-foreground">Draft Posts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.totalPillars || 0}</p>
              <p className="text-sm text-muted-foreground">Content Pillars</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.profileCompletion || 0}%</p>
              <p className="text-sm text-muted-foreground">Profile Completion</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.upcomingPosts || 0}</p>
              <p className="text-sm text-muted-foreground">Upcoming Posts</p>
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
              <h3 className="font-medium">Welcome to Link Pro!</h3>
              <p className="text-sm text-muted-foreground">Account created successfully</p>
              <p className="text-xs text-muted-foreground mt-1">Just now</p>
            </div>
          </div>
          
          {stats?.lastPostDate && (
            <div className="relative">
              <div className="absolute -left-8 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
              <div>
                <h3 className="font-medium">Latest Activity</h3>
                <p className="text-sm text-muted-foreground">
                  Last post: {new Date(stats.lastPostDate).toLocaleDateString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(stats.lastPostDate).toLocaleTimeString()}
                </p>
              </div>
            </div>
          )}
          
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
  )
} 