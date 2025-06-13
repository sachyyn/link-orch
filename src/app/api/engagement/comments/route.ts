import { createGetHandler, createPostHandler } from '@/lib/api-wrapper'
import { z } from 'zod'

// Validation schema for comment creation
const createCommentSchema = z.object({
  postId: z.number(),
  postTitle: z.string().min(1).max(500),
  authorName: z.string().min(1).max(200),
  authorProfileUrl: z.string().url().optional(),
  content: z.string().min(1).max(3000),
  linkedinUrl: z.string().url().optional(),
  sentiment: z.enum(['positive', 'neutral', 'negative']).default('neutral'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
})

// Types for comment management
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
  linkedinUrl?: string
  createdAt: string
  updatedAt: string
  repliedAt?: string
  responseTemplateId?: number
}

interface CommentQuery {
  page?: number
  limit?: number
  status?: 'unread' | 'read' | 'replied' | 'ignored'
  priority?: 'low' | 'medium' | 'high'
  sentiment?: 'positive' | 'neutral' | 'negative'
  search?: string
  postId?: number
}

interface CommentListResponse {
  comments: Comment[]
  pagination: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
  stats: {
    totalComments: number
    unreadComments: number
    repliedComments: number
    responseRate: number
    avgResponseTime: number // in hours
  }
  sentimentBreakdown: {
    positive: number
    neutral: number
    negative: number
  }
}

/**
 * GET /api/engagement/comments
 * 
 * Retrieves comments from LinkedIn posts with filtering and analytics
 * Includes sentiment analysis and response tracking
 */
export const GET = createGetHandler<any, CommentListResponse>(
  async ({ userId, query }) => {
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      sentiment,
      search,
      postId
    } = (query || {}) as CommentQuery

    // Mock comments data - in production, this would fetch from database
    const mockComments: Comment[] = [
      {
        id: 1,
        postId: 1,
        postTitle: "5 LinkedIn Growth Strategies That Actually Work",
        authorName: "Sarah Johnson",
        authorProfileUrl: "https://linkedin.com/in/sarahjohnson",
        content: "This is incredibly helpful! I've been struggling with LinkedIn growth. Could you share more about strategy #3? I'm particularly interested in how you measure engagement quality vs quantity.",
        status: 'unread',
        priority: 'high',
        sentiment: 'positive',
        linkedinUrl: 'https://linkedin.com/feed/update/activity:123',
        createdAt: '2024-02-15T14:30:00Z',
        updatedAt: '2024-02-15T14:30:00Z',
      },
      {
        id: 2,
        postId: 1,
        postTitle: "5 LinkedIn Growth Strategies That Actually Work",
        authorName: "Michael Chen",
        content: "Great post! I implemented strategy #1 and saw immediate results. Thank you for sharing! My engagement rate increased by 40% in just two weeks.",
        status: 'replied',
        priority: 'medium',
        sentiment: 'positive',
        linkedinUrl: 'https://linkedin.com/feed/update/activity:124',
        createdAt: '2024-02-15T12:15:00Z',
        updatedAt: '2024-02-15T16:45:00Z',
        repliedAt: '2024-02-15T16:45:00Z',
        responseTemplateId: 1,
      },
      {
        id: 3,
        postId: 2,
        postTitle: "Content Calendar Template for LinkedIn Success",
        authorName: "Emma Rodriguez",
        content: "This template looks amazing! Is there a way to customize it for B2B companies specifically? I work in SaaS and our content needs are quite unique.",
        status: 'read',
        priority: 'medium',
        sentiment: 'positive',
        linkedinUrl: 'https://linkedin.com/feed/update/activity:125',
        createdAt: '2024-02-14T16:45:00Z',
        updatedAt: '2024-02-14T17:00:00Z',
      },
      {
        id: 4,
        postId: 3,
        postTitle: "The Psychology Behind LinkedIn Viral Content",
        authorName: "David Park",
        content: "Interesting perspective, but I disagree with point #2. In my experience, overly emotional content can backfire in B2B contexts. What's your take on maintaining professionalism?",
        status: 'unread',
        priority: 'high',
        sentiment: 'neutral',
        linkedinUrl: 'https://linkedin.com/feed/update/activity:126',
        createdAt: '2024-02-13T11:20:00Z',
        updatedAt: '2024-02-13T11:20:00Z',
      },
      {
        id: 5,
        postId: 1,
        postTitle: "5 LinkedIn Growth Strategies That Actually Work",
        authorName: "Lisa Wang",
        content: "Thanks for this! Quick question - how do you handle negative comments or trolls? I've been getting some lately and not sure how to respond professionally.",
        status: 'unread',
        priority: 'medium',
        sentiment: 'neutral',
        linkedinUrl: 'https://linkedin.com/feed/update/activity:127',
        createdAt: '2024-02-12T09:30:00Z',
        updatedAt: '2024-02-12T09:30:00Z',
      },
    ]

    // Apply filters
    let filteredComments = mockComments.filter(comment => comment !== null)

    if (status) {
      filteredComments = filteredComments.filter(comment => comment.status === status)
    }

    if (priority) {
      filteredComments = filteredComments.filter(comment => comment.priority === priority)
    }

    if (sentiment) {
      filteredComments = filteredComments.filter(comment => comment.sentiment === sentiment)
    }

    if (postId) {
      filteredComments = filteredComments.filter(comment => comment.postId === postId)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filteredComments = filteredComments.filter(comment => 
        comment.content.toLowerCase().includes(searchLower) ||
        comment.authorName.toLowerCase().includes(searchLower) ||
        comment.postTitle.toLowerCase().includes(searchLower)
      )
    }

    // Apply pagination
    const startIndex = (page - 1) * limit
    const paginatedComments = filteredComments.slice(startIndex, startIndex + limit)

    // Calculate stats
    const totalComments = mockComments.length
    const unreadComments = mockComments.filter(c => c.status === 'unread').length
    const repliedComments = mockComments.filter(c => c.status === 'replied').length
    const responseRate = totalComments > 0 ? (repliedComments / totalComments) * 100 : 0

    // Calculate average response time (in hours)
    const repliedCommentsWithTime = mockComments.filter(c => c.repliedAt && c.createdAt)
    const avgResponseTime = repliedCommentsWithTime.length > 0 
      ? repliedCommentsWithTime.reduce((sum, comment) => {
          const created = new Date(comment.createdAt).getTime()
          const replied = new Date(comment.repliedAt!).getTime()
          return sum + (replied - created) / (1000 * 60 * 60) // Convert to hours
        }, 0) / repliedCommentsWithTime.length
      : 0

    // Calculate sentiment breakdown
    const sentimentBreakdown = {
      positive: mockComments.filter(c => c.sentiment === 'positive').length,
      neutral: mockComments.filter(c => c.sentiment === 'neutral').length,
      negative: mockComments.filter(c => c.sentiment === 'negative').length,
    }

    const response: CommentListResponse = {
      comments: paginatedComments,
      pagination: {
        page,
        limit,
        total: filteredComments.length,
        hasMore: startIndex + limit < filteredComments.length,
      },
      stats: {
        totalComments,
        unreadComments,
        repliedComments,
        responseRate: Math.round(responseRate * 10) / 10,
        avgResponseTime: Math.round(avgResponseTime * 10) / 10,
      },
      sentimentBreakdown,
    }

    return response
  },
  {
    requireAuth: true,
    sanitizeInput: true,
    enableLogging: process.env.NODE_ENV === 'development',
  }
)

/**
 * POST /api/engagement/comments
 * 
 * Creates a new comment entry (typically from LinkedIn webhook or manual import)
 * Includes sentiment analysis and priority assignment
 */
export const POST = createPostHandler<any, Comment>(
  async ({ userId, body }) => {
    const commentData = body

    // Simulate sentiment analysis (in production, use AI service)
    const sentimentScore = Math.random()
    const sentiment = sentimentScore > 0.6 ? 'positive' : 
                     sentimentScore > 0.3 ? 'neutral' : 'negative'

    // Auto-assign priority based on content analysis
    const isQuestion = commentData.content.includes('?')
    const hasUrgentWords = /urgent|asap|immediate|help|problem/i.test(commentData.content)
    const priority = hasUrgentWords ? 'high' : isQuestion ? 'medium' : 'low'

    const newComment: Comment = {
      id: Math.floor(Math.random() * 10000) + 1000,
      ...commentData,
      status: 'unread',
      priority: commentData.priority || priority,
      sentiment: commentData.sentiment || sentiment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return newComment
  },
  {
    bodySchema: createCommentSchema,
    requireAuth: true,
    sanitizeInput: true,
    enableLogging: process.env.NODE_ENV === 'development',
  }
) 