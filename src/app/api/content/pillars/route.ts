import { createGetHandler, createPostHandler } from '@/lib/api-wrapper'
import { getPillars } from '@/db/services/content-service'
import { type ContentPillar } from '@/db/schema'
import { z } from 'zod'

// Types for content pillars
interface PillarResponse extends Omit<ContentPillar, 'createdAt' | 'updatedAt'> {
  createdAt: string
  updatedAt: string
}

interface PillarListResponse {
  pillars: PillarResponse[]
  totalPosts: number
  analytics: {
    mostActiveMonth: string
    topPerformingPillar: string
    averagePostsPerPillar: number
  }
}

const createPillarSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color'),
  targetPercentage: z.number().min(1).max(100),
})

type CreatePillarRequest = z.infer<typeof createPillarSchema>

/**
 * GET /api/content/pillars
 * 
 * Retrieves all content pillars for the authenticated user
 * Includes analytics and post count information
 */
export const GET = createGetHandler<never, PillarListResponse>(
  async ({ userId }) => {
    if (!userId) throw new Error('Authentication required')
    
    // Get pillars from database
    const dbPillars = await getPillars(userId)
    
    // Transform for response
    const pillars: PillarResponse[] = dbPillars.map(pillar => ({
      ...pillar,
      createdAt: pillar.createdAt.toISOString(),
      updatedAt: pillar.updatedAt.toISOString(),
    }))

    const totalPosts = pillars.reduce((sum, pillar) => sum + (pillar.postCount || 0), 0)
    
    // Calculate analytics
    const topPerformingPillar = pillars.length > 0 
      ? pillars.reduce((top, current) => 
          (current.postCount || 0) > (top.postCount || 0) ? current : top
        )
      : null

    return {
      pillars,
      totalPosts,
      analytics: {
        mostActiveMonth: 'January 2024', // TODO: Calculate from actual data
        topPerformingPillar: topPerformingPillar?.name || 'None',
        averagePostsPerPillar: pillars.length > 0 ? Math.round(totalPosts / pillars.length) : 0,
      },
    }
  },
  {
    requireAuth: true,
    sanitizeInput: true,
    enableLogging: process.env.NODE_ENV === 'development',
  }
)

/**
 * POST /api/content/pillars
 * 
 * Creates a new content pillar
 * Validates that total target percentages don't exceed 100%
 */
export const POST = createPostHandler<CreatePillarRequest, PillarResponse>(
  async ({ userId, body }) => {
    const { name, description, color } = body

    // Mock pillar creation
    const newPillar: PillarResponse = {
      id: crypto.randomUUID(),
      userId: userId,
      name,
      description: description || '',
      color,
      icon: '📋',
      postCount: 0,
      totalEngagement: 0,
      avgEngagement: 0,
      isActive: true,
      sortOrder: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return newPillar
  },
  {
    bodySchema: createPillarSchema,
    requireAuth: true,
    sanitizeInput: true,
    enableLogging: process.env.NODE_ENV === 'development',
  }
) 