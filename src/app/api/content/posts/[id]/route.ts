import { createGetHandler, createPutHandler, createDeleteHandler } from '@/lib/api-wrapper'
import { contentPostSchema } from '@/lib/validations'

// Types for our API responses
interface PostResponse {
  id: number
  title: string
  content: string
  status: 'draft' | 'scheduled' | 'published' | 'failed' | 'archived'
  scheduledAt: string | null
  publishedAt: string | null
  pillarId: number | null
  pillarName?: string
  hashtags: string[]
  mentions: string[]
  mediaUrls: string[]
  viewCount: number
  createdAt: string
  updatedAt: string
}

interface DeleteResponse {
  success: boolean
  message: string
}

/**
 * GET /api/content/posts/[id]
 * 
 * Retrieves a single content post by ID
 * Only returns posts owned by the authenticated user
 */
export const GET = createGetHandler<never, PostResponse>(
  async ({ userId, params }) => {
    if (!params?.id) {
      throw new Error('Post ID is required')
    }

    const postId = parseInt(params.id as string)
    if (isNaN(postId)) {
      throw new Error('Invalid post ID')
    }

    // Mock data for demonstration
    const mockPost: PostResponse = {
      id: postId,
      title: "Sample LinkedIn Post",
      content: "This is a sample LinkedIn post content that demonstrates our post management system...",
      status: 'published',
      scheduledAt: null,
      publishedAt: '2024-01-15T10:00:00Z',
      pillarId: 1,
      pillarName: 'Thought Leadership',
      hashtags: ['#LinkedIn', '#ThoughtLeadership', '#PersonalBranding'],
      mentions: ['@linkedinhelp'],
      mediaUrls: ['https://example.com/image1.jpg'],
      viewCount: 1250,
      createdAt: '2024-01-15T09:00:00Z',
      updatedAt: '2024-01-15T09:00:00Z',
    }

    // Simulate post not found for IDs > 1000
    if (postId > 1000) {
      throw new Error('Post not found')
    }

    return mockPost
  },
  {
    requireAuth: true,
    sanitizeInput: true,
    enableLogging: process.env.NODE_ENV === 'development',
  }
)

/**
 * PUT /api/content/posts/[id]
 * 
 * Updates an existing content post
 * Only allows updating posts owned by the authenticated user
 */
export const PUT = createPutHandler<any, PostResponse>(
  async ({ userId, params, body }) => {
    if (!params?.id) {
      throw new Error('Post ID is required')
    }

    const postId = parseInt(params.id as string)
    if (isNaN(postId)) {
      throw new Error('Invalid post ID')
    }

    // Simulate post not found for IDs > 1000
    if (postId > 1000) {
      throw new Error('Post not found')
    }

    const {
      title,
      content,
      status,
      scheduledAt,
      pillarId,
      hashtags = [],
      mentions = [],
      mediaUrls = [],
    } = body

    // Validate scheduled date is in the future if provided
    if (scheduledAt) {
      const parsedScheduledAt = new Date(scheduledAt)
      if (parsedScheduledAt <= new Date()) {
        throw new Error('Scheduled date must be in the future')
      }
    }

    // Validate pillar exists (mock validation)
    if (pillarId && pillarId > 5) {
      throw new Error('Content pillar not found')
    }

    // Mock updated post
    const updatedPost: PostResponse = {
      id: postId,
      title: title || "Updated LinkedIn Post",
      content: content || "This post has been updated...",
      status: status || 'draft',
      scheduledAt: scheduledAt || null,
      publishedAt: status === 'published' ? new Date().toISOString() : null,
      pillarId: pillarId || null,
      pillarName: pillarId ? `Pillar ${pillarId}` : undefined,
      hashtags: hashtags || [],
      mentions: mentions || [],
      mediaUrls: mediaUrls || [],
      viewCount: 1250, // Keep existing view count
      createdAt: '2024-01-15T09:00:00Z', // Keep original creation date
      updatedAt: new Date().toISOString(), // Update modification date
    }

    return updatedPost
  },
  {
    requireAuth: true,
    sanitizeInput: true,
    enableLogging: process.env.NODE_ENV === 'development',
  }
)

/**
 * DELETE /api/content/posts/[id]
 * 
 * Deletes a content post
 * Only allows deleting posts owned by the authenticated user
 */
export const DELETE = createDeleteHandler<never, DeleteResponse>(
  async ({ userId, params }) => {
    if (!params?.id) {
      throw new Error('Post ID is required')
    }

    const postId = parseInt(params.id as string)
    if (isNaN(postId)) {
      throw new Error('Invalid post ID')
    }

    // Simulate post not found for IDs > 1000
    if (postId > 1000) {
      throw new Error('Post not found')
    }

    // Simulate published posts cannot be deleted
    if (postId === 1) {
      throw new Error('Cannot delete published posts. Archive them instead.')
    }

    // Mock successful deletion
    return {
      success: true,
      message: `Post ${postId} has been successfully deleted`,
    }
  },
  {
    requireAuth: true,
    sanitizeInput: true,
    enableLogging: process.env.NODE_ENV === 'development',
  }
) 