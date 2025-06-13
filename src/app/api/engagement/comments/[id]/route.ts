import { createGetHandler, createPutHandler, createDeleteHandler } from '@/lib/api-wrapper'
import { z } from 'zod'

// Validation schema for comment updates
const updateCommentSchema = z.object({
  status: z.enum(['unread', 'read', 'replied', 'ignored']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  responseTemplateId: z.number().optional(),
  repliedAt: z.string().datetime().optional(),
}).strict()

// Comment interface (matching the main comments route)
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

/**
 * GET /api/engagement/comments/[id]
 * 
 * Retrieves a specific comment by ID
 */
export const GET = createGetHandler<{ id: string }, Comment>(
  async ({ userId, params }) => {
    const commentId = parseInt(params.id)
    
    if (isNaN(commentId)) {
      throw new Error('Invalid comment ID')
    }

    // Mock comment data - in production, this would fetch from database
    const mockComments: Comment[] = [
      {
        id: 1,
        postId: 1,
        postTitle: "5 LinkedIn Growth Strategies That Actually Work",
        authorName: "Sarah Johnson",
        authorProfileUrl: "https://linkedin.com/in/sarahjohnson",
        content: "This is incredibly helpful! I've been struggling with LinkedIn growth. Could you share more about strategy #3?",
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
        content: "Great post! I implemented strategy #1 and saw immediate results. Thank you for sharing!",
        status: 'replied',
        priority: 'medium',
        sentiment: 'positive',
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
        content: "This template looks amazing! Is there a way to customize it for B2B companies specifically?",
        status: 'read',
        priority: 'medium',
        sentiment: 'positive',
        createdAt: '2024-02-14T16:45:00Z',
        updatedAt: '2024-02-14T17:00:00Z',
      },
    ]

    const comment = mockComments.find(c => c.id === commentId)
    
    if (!comment) {
      throw new Error('Comment not found')
    }

    return comment
  },
  {
    requireAuth: true,
    sanitizeInput: true,
    enableLogging: process.env.NODE_ENV === 'development',
  }
)

/**
 * PUT /api/engagement/comments/[id]
 * 
 * Updates comment status, priority, or marks as replied
 */
export const PUT = createPutHandler<z.infer<typeof updateCommentSchema>, Comment>(
  async ({ userId, body, params }) => {
    const commentId = parseInt(params.id)
    
    if (isNaN(commentId)) {
      throw new Error('Invalid comment ID')
    }

    // Mock comment retrieval and update
    const mockComment: Comment = {
      id: commentId,
      postId: 1,
      postTitle: "5 LinkedIn Growth Strategies That Actually Work",
      authorName: "Sarah Johnson",
      authorProfileUrl: "https://linkedin.com/in/sarahjohnson",
      content: "This is incredibly helpful! I've been struggling with LinkedIn growth.",
      status: 'unread',
      priority: 'high',
      sentiment: 'positive',
      linkedinUrl: 'https://linkedin.com/feed/update/activity:123',
      createdAt: '2024-02-15T14:30:00Z',
      updatedAt: '2024-02-15T14:30:00Z',
    }

    // Apply updates
    const updatedComment: Comment = {
      ...mockComment,
      ...body,
      updatedAt: new Date().toISOString(),
    }

    // If marking as replied, set repliedAt timestamp
    if (body.status === 'replied' && !updatedComment.repliedAt) {
      updatedComment.repliedAt = new Date().toISOString()
    }

    return updatedComment
  },
  {
    bodySchema: updateCommentSchema,
    requireAuth: true,
    sanitizeInput: true,
    enableLogging: process.env.NODE_ENV === 'development',
  }
)

/**
 * DELETE /api/engagement/comments/[id]
 * 
 * Deletes a comment (marks as ignored in production to maintain audit trail)
 */
export const DELETE = createDeleteHandler<{ success: boolean; message: string }>(
  async ({ userId, params }) => {
    const commentId = parseInt(params.id)
    
    if (isNaN(commentId)) {
      throw new Error('Invalid comment ID')
    }

    // In production, would soft delete or mark as ignored
    // For now, simulate successful deletion
    
    return {
      success: true,
      message: `Comment ${commentId} has been deleted`,
    }
  },
  {
    requireAuth: true,
    sanitizeInput: true,
    enableLogging: process.env.NODE_ENV === 'development',
  }
) 