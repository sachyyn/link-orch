import { createGetHandler, createPostHandler } from '@/lib/api-wrapper'
import { contentFilterSchema, contentPostSchema } from '@/lib/validations'
import { getPosts, createPost, type PostFilters, type PostListResult } from '@/db/services/content-service'
import { type ContentPost } from '@/db/schema'

// Types for our API responses (matching database schema)
interface PostResponse extends Omit<ContentPost, 'createdAt' | 'updatedAt' | 'scheduledAt' | 'publishedAt'> {
  scheduledAt: string | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  pillarName?: string
}

interface PostListResponse {
  posts: PostResponse[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * GET /api/content/posts
 * 
 * Retrieves paginated list of content posts with filtering options
 * Query parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - status: Filter by post status
 * - pillarId: Filter by content pillar
 * - search: Search in title and content
 * - startDate: Filter posts created after date
 * - endDate: Filter posts created before date
 */
export const GET = createGetHandler<PostFilters, PostListResponse>(
  async ({ userId, query }) => {
    // Use real database service
    if (!userId) {
      throw new Error('User ID is required')
    }
    const result = await getPosts(userId, query || {})
    
    // Transform dates to strings for JSON serialization
    const transformedPosts = result.posts.map(post => ({
      ...post,
      scheduledAt: post.scheduledAt?.toISOString() || null,
      publishedAt: post.publishedAt?.toISOString() || null,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      hashtags: post.hashtags || [],
      mentions: post.mentions || [],
      mediaUrls: post.mediaUrls || [],
    }))

    return {
      posts: transformedPosts,
      pagination: result.pagination,
    }
  },
  {
    requireAuth: true,
    querySchema: contentFilterSchema,
    sanitizeInput: true,
    enableLogging: process.env.NODE_ENV === 'development',
  }
)

/**
 * POST /api/content/posts
 * 
 * Creates a new content post
 * Body schema: contentPostSchema
 */
export const POST = createPostHandler<any, PostResponse>(
  async ({ userId, body }) => {
    const {
      title,
      content,
      status = 'draft',
      scheduledAt,
      pillarId,
      hashtags = [],
      mentions = [],
      mediaUrls = [],
    } = body

    // Validate scheduled date is in the future
    if (scheduledAt) {
      const parsedScheduledAt = new Date(scheduledAt)
      if (parsedScheduledAt <= new Date()) {
        throw new Error('Scheduled date must be in the future')
      }
    }

    // Create post using database service
    const newPost = await createPost(userId, {
      title,
      content,
      status,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      pillarId: pillarId || null,
      hashtags: hashtags || [],
      mentions: mentions || [],
      mediaUrls: mediaUrls || [],
    })

    // Transform for response
    return {
      ...newPost,
      scheduledAt: newPost.scheduledAt?.toISOString() || null,
      publishedAt: newPost.publishedAt?.toISOString() || null,
      createdAt: newPost.createdAt.toISOString(),
      updatedAt: newPost.updatedAt.toISOString(),
      hashtags: newPost.hashtags || [],
      mentions: newPost.mentions || [],
      mediaUrls: newPost.mediaUrls || [],
    }
  },
  {
    bodySchema: contentPostSchema,
    requireAuth: true,
    sanitizeInput: true,
    enableLogging: process.env.NODE_ENV === 'development',
  }
) 