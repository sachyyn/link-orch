"use client"

import { useState, useMemo } from "react"
import { 
  useComments, 
  useEngagementTemplates, 
  useEngagementMetrics 
} from "@/hooks/use-api"
import { CommentInbox } from "./comment-inbox"
import { ResponseTemplates } from "./response-templates"
import { EngagementTracking } from "./engagement-tracking"
import { EngagementFilters } from "./engagement-filters"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, MessageSquare, FileText, TrendingUp } from "lucide-react"

export function EngagementManagement() {
  const [activeTab, setActiveTab] = useState('inbox')
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    sentiment: ''
  })

  // Build API parameters for comments
  const commentsParams = useMemo(() => {
    const params: any = {}
    if (filters.status) params.status = filters.status
    if (filters.priority) params.priority = filters.priority  
    if (filters.sentiment) params.sentiment = filters.sentiment
    if (searchQuery) params.search = searchQuery
    return params
  }, [filters, searchQuery])

  // Fetch data using React Query hooks
  const { 
    data: commentsData, 
    isLoading: commentsLoading, 
    error: commentsError,
    refetch: refetchComments 
  } = useComments(commentsParams)

  const { 
    data: templatesData, 
    isLoading: templatesLoading,
    error: templatesError 
  } = useEngagementTemplates()

  const { 
    data: metricsData, 
    isLoading: metricsLoading,
    error: metricsError 
  } = useEngagementMetrics()

  // Extract data from API responses
  const comments = commentsData?.comments || []
  const templates = templatesData?.templates || []
  const metrics = metricsData?.metrics || []

  const isLoading = commentsLoading || templatesLoading || metricsLoading
  const hasError = commentsError || templatesError || metricsError

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  const filteredComments = comments?.filter((comment: any) => {
    if (!comment) return false
    
    const matchesSearch = searchQuery === '' || 
      comment.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.authorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.postTitle?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = filters.status === '' || comment.status === filters.status
    const matchesPriority = filters.priority === '' || comment.priority === filters.priority
    const matchesSentiment = filters.sentiment === '' || comment.sentiment === filters.sentiment
    
    return matchesSearch && matchesStatus && matchesPriority && matchesSentiment
  }) || []

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          {/* Search Bar Skeleton */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <Skeleton className="h-10 w-80" />
            <Skeleton className="h-10 w-32" />
          </div>
          
          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
          
          {/* Tabs Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (hasError) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">Failed to load engagement data</p>
          <Button 
            onClick={() => {
              refetchComments()
              window.location.reload()
            }} 
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search comments and interactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <EngagementFilters filters={filters} onFilterChange={handleFilterChange} />
      </div>

      {/* Engagement Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">{filteredComments.length}</div>
          <div className="text-sm text-gray-600">Total Comments</div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-600">
            {filteredComments.filter((comment: any) => comment?.status === 'unread').length}
          </div>
          <div className="text-sm text-gray-600">Unread</div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {filteredComments.filter((comment: any) => comment?.status === 'replied').length}
          </div>
          <div className="text-sm text-gray-600">Replied</div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">
            {Math.round(metrics.reduce((sum: number, metric: any) => sum + (metric?.responseRate || 0), 0) / Math.max(metrics.length, 1))}%
          </div>
          <div className="text-sm text-gray-600">Avg Response Rate</div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="inbox" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Comment Inbox
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <FileText className="h-4 w-4" />
            Response Templates
          </TabsTrigger>
          <TabsTrigger value="tracking" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Engagement Tracking
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox">
          <CommentInbox comments={filteredComments} templates={templates} />
        </TabsContent>

        <TabsContent value="templates">
          <ResponseTemplates templates={templates} />
        </TabsContent>

        <TabsContent value="tracking">
          <EngagementTracking metrics={metrics} />
        </TabsContent>
      </Tabs>
    </div>
  )
} 