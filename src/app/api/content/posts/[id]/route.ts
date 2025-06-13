import { createGetHandler, createPutHandler, createDeleteHandler } from '@/lib/api-wrapper'
import { contentPostSchema } from '@/lib/validations'
import { getPostById, updatePost, deletePost } from '@/db/services/content-service'
import { type ContentPost } from '@/db/schema'

// Types for our API responses (matching database schema)
interface PostResponse extends Omit<ContentPost, 'createdAt' | 'updatedAt' | 'scheduledAt' | 'publishedAt'> {
  scheduledAt: string | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  pillarName?: string
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
    if (!userId) {
      throw new Error('User ID is required')
    }

    if (!params?.id) {
      throw new Error('Post ID is required')
    }

    const postId = params.id as string
    
    // Get post from database
    const post = await getPostById(userId, postId)
    
    if (!post) {
      throw new Error('Post not found')
    }

    // Transform for response
    return {
      ...post,
      scheduledAt: post.scheduledAt?.toISOString() || null,
      publishedAt: post.publishedAt?.toISOString() || null,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      hashtags: post.hashtags || [],
      mentions: post.mentions || [],
      mediaUrls: post.mediaUrls || [],
    }
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
    if (!userId) {
      throw new Error('User ID is required')
    }

    if (!params?.id) {
      throw new Error('Post ID is required')
    }

    const postId = params.id as string
    
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

    // Update post using database service
    const updatedPost = await updatePost(userId, postId, {
      title,
      content,
      status,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      pillarId: pillarId || null,
      hashtags: hashtags || [],
      mentions: mentions || [],
      mediaUrls: mediaUrls || [],
    })

    if (!updatedPost) {
      throw new Error('Post not found or update failed')
    }

    // Transform for response
    return {
      ...updatedPost,
      scheduledAt: updatedPost.scheduledAt?.toISOString() || null,
      publishedAt: updatedPost.publishedAt?.toISOString() || null,
      createdAt: updatedPost.createdAt.toISOString(),
      updatedAt: updatedPost.updatedAt.toISOString(),
      hashtags: updatedPost.hashtags || [],
      mentions: updatedPost.mentions || [],
      mediaUrls: updatedPost.mediaUrls || [],
    }
  },
  {
    bodySchema: contentPostSchema,
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
export const DELETE = createDeleteHandler<DeleteResponse>(
  async ({ userId, params }) => {
    if (!userId) {
      throw new Error('User ID is required')
    }

    if (!params?.id) {
      throw new Error('Post ID is required')
    }

    const postId = params.id as string
    
    // Delete post using database service
    const success = await deletePost(userId, postId)
    
    if (!success) {
      throw new Error('Post not found or deletion failed')
    }

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