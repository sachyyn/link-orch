"use client"

import { useState, useEffect } from "react"
import { CommentInbox } from "./comment-inbox"
import { ResponseTemplates } from "./response-templates"
import { EngagementTracking } from "./engagement-tracking"
import { EngagementFilters } from "./engagement-filters"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, MessageSquare, FileText, TrendingUp } from "lucide-react"

interface Comment {
  id: number
  postId: number
  postTitle: string
  authorName: string
  authorProfileUrl?: string
  content: string
  status: 'unread' | 'read' | 'replied' | 'ignored'
  priority: 'low' | 'medium' | 'high'
  sentiment: 'positive' | 'neutral' | 'negative'
  createdAt: string
  linkedinUrl?: string
}

interface ResponseTemplate {
  id: number
  title: string
  content: string
  category: 'appreciation' | 'question_answer' | 'follow_up' | 'networking' | 'general'
  usage_count: number
  createdAt: string
}

interface EngagementMetric {
  id: number
  postId: number
  postTitle: string
  comments: number
  replies: number
  responseRate: number
  avgResponseTime: number // in hours
  sentiment: {
    positive: number
    neutral: number
    negative: number
  }
  createdAt: string
}

export function EngagementManagement() {
  const [comments, setComments] = useState<Comment[]>([])
  const [templates, setTemplates] = useState<ResponseTemplate[]>([])
  const [metrics, setMetrics] = useState<EngagementMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('inbox')
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    sentiment: ''
  })

  useEffect(() => {
    fetchEngagementData()
  }, [filters, searchQuery])

  const fetchEngagementData = async () => {
    try {
      setLoading(true)
      
      // Build query parameters for comments
      const queryParams = new URLSearchParams()
      if (filters.status) queryParams.append('status', filters.status)
      if (filters.priority) queryParams.append('priority', filters.priority)
      if (filters.sentiment) queryParams.append('sentiment', filters.sentiment)
      if (searchQuery) queryParams.append('search', searchQuery)

      // Fetch all data in parallel
      const [commentsResponse, templatesResponse, metricsResponse] = await Promise.all([
        fetch(`/api/engagement/comments?${queryParams}`),
        fetch('/api/engagement/templates'),
        fetch('/api/engagement/metrics')
      ])

      const [commentsData, templatesData, metricsData] = await Promise.all([
        commentsResponse.json(),
        templatesResponse.json(),
        metricsResponse.json()
      ])

      // Handle comments response
      if (commentsResponse.ok && commentsData.success) {
        setComments(commentsData.data?.comments || [])
      } else {
        console.error('Error fetching comments:', commentsData.error)
        setComments([])
      }

      // Handle templates response
      if (templatesResponse.ok && templatesData.success) {
        setTemplates(templatesData.data?.templates || [])
      } else {
        console.error('Error fetching templates:', templatesData.error)
        setTemplates([])
      }

      // Handle metrics response
      if (metricsResponse.ok && metricsData.success) {
        setMetrics(metricsData.data?.metrics || [])
      } else {
        console.error('Error fetching metrics:', metricsData.error)
        setMetrics([])
      }
    } catch (error) {
      console.error('Error fetching engagement data:', error)
      setComments([])
      setTemplates([])
      setMetrics([])
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  const filteredComments = comments?.filter(comment => {
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
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
            {filteredComments.filter(comment => comment?.status === 'unread').length}
          </div>
          <div className="text-sm text-gray-600">Unread</div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {filteredComments.filter(comment => comment?.status === 'replied').length}
          </div>
          <div className="text-sm text-gray-600">Replied</div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">
            {metrics.reduce((sum, metric) => sum + (metric?.responseRate || 0), 0) / Math.max(metrics.length, 1)}%
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