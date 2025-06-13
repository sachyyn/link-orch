import { createGetHandler, createPostHandler } from '@/lib/api-wrapper'
import { getPillars, createPillar } from '@/db/services/content-service'
import { type ContentPillar } from '@/db/schema'

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

interface CreatePillarRequest {
  name: string
  description?: string
  color: string
  targetPercentage: number
}

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
export const POST = createPostHandler<any, PillarResponse>(
  async ({ userId, body }) => {
    const { name, description, color, targetPercentage } = body as CreatePillarRequest

    // Validate required fields
    if (!name || !color || typeof targetPercentage !== 'number') {
      throw new Error('Name, color, and targetPercentage are required')
    }

    // Validate name length
    if (name.length < 2 || name.length > 50) {
      throw new Error('Pillar name must be between 2 and 50 characters')
    }

    // Validate color format (hex color)
    if (!/^#[0-9A-F]{6}$/i.test(color)) {
      throw new Error('Color must be a valid hex color (e.g., #3B82F6)')
    }

    // Validate target percentage
    if (targetPercentage < 1 || targetPercentage > 100) {
      throw new Error('Target percentage must be between 1 and 100')
    }

    // Mock validation: Check if total percentages would exceed 100%
    const existingTotalPercentage = 100 // Mock current total
    if (existingTotalPercentage + targetPercentage > 100) {
      throw new Error(`Adding this pillar would exceed 100% allocation. Current total: ${existingTotalPercentage}%`)
    }

    // Mock pillar creation
    const newPillar: PillarResponse = {
      id: Math.floor(Math.random() * 10000),
      name,
      description: description || '',
      color,
      targetPercentage,
      postCount: 0,
      lastPostDate: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return newPillar
  },
  {
    requireAuth: true,
    sanitizeInput: true,
    enableLogging: process.env.NODE_ENV === 'development',
  }
) 