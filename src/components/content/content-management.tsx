"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { usePosts, usePillars } from '@/hooks/use-api'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Filter, Search, Calendar, Table2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { ContentTable } from "./content-table"
import { ContentCalendar } from "./content-calendar"

export function ContentManagement() {
  const router = useRouter()
  const [view, setView] = useState<"table" | "calendar">("table")
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    status: 'all',
    pillar: 'all',
    dateRange: '30',
  })

  // Build API parameters from filters and search
  const apiParams = useMemo(() => {
    const params: any = {}
    
    if (filters.status !== 'all') {
      params.status = filters.status
    }
    
    if (filters.pillar !== 'all') {
      params.pillarId = parseInt(filters.pillar)
    }
    
    if (searchQuery) {
      params.search = searchQuery
    }
    
    // Convert dateRange to actual dates
    if (filters.dateRange !== 'all') {
      const days = parseInt(filters.dateRange)
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000))
      
      // Set startDate to beginning of day (00:00:00) and endDate to end of day (23:59:59)
      // to capture the full date range when filtering
      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(23, 59, 59, 999)
      
      // Send full ISO datetime strings to match API validation schema
      params.startDate = startDate.toISOString()
      params.endDate = endDate.toISOString()
    }
    
    return params
  }, [filters, searchQuery])

  // Fetch posts with real-time filtering
  const { 
    data: posts, 
    isLoading: postsLoading, 
    error: postsError 
  } = usePosts(apiParams)

  // Fetch pillars for filter dropdown
  const { 
    data: pillars, 
    isLoading: pillarsLoading 
  } = usePillars()

  const handleNewPost = () => {
    router.push('/content/new')
  }

  // Loading state
  if (postsLoading || pillarsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          {/* Action Bar Skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-80" />
              <Skeleton className="h-10 w-20" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-28" />
            </div>
          </div>
          
          {/* Content Skeleton */}
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (postsError) {
    return (
      <div className="p-6">
        <div className="text-center text-red-500 p-8">
          <p>Failed to load content. Please try again.</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            className="mt-4"
          >
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
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-80 pl-10"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <Tabs value={view} onValueChange={(value) => setView(value as "table" | "calendar")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="table" className="flex items-center gap-2">
                <Table2 className="h-4 w-4" />
                Table
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Calendar
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button onClick={handleNewPost}>
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>
      </div>

      {/* Content Views with Real Data */}
      {view === "table" ? (
        <ContentTable 
          posts={posts || []} 
          searchQuery={searchQuery} 
          pillars={pillars || []}
        />
      ) : (
        <ContentCalendar 
          posts={posts || []} 
          searchQuery={searchQuery}
          pillars={pillars || []}
        />
      )}
    </div>
  )
} 