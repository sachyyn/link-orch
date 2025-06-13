import { createGetHandler, createPostHandler } from '@/lib/api-wrapper'

// Types for content pillars
interface PillarResponse {
  id: number
  name: string
  description: string
  color: string
  targetPercentage: number
  postCount: number
  lastPostDate: string | null
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
    // Mock pillars data demonstrating comprehensive pillar management
    const mockPillars: PillarResponse[] = [
      {
        id: 1,
        name: 'Thought Leadership',
        description: 'Industry insights and strategic thinking',
        color: '#3B82F6', // Blue
        targetPercentage: 40,
        postCount: 45,
        lastPostDate: '2024-01-15T10:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 2,
        name: 'Company Culture',
        description: 'Behind-the-scenes and team highlights',
        color: '#10B981', // Green
        targetPercentage: 25,
        postCount: 28,
        lastPostDate: '2024-01-14T15:30:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 3,
        name: 'Educational Content',
        description: 'Tips, tutorials, and how-to guides',
        color: '#F59E0B', // Amber
        targetPercentage: 20,
        postCount: 32,
        lastPostDate: '2024-01-13T09:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 4,
        name: 'Personal Stories',
        description: 'Personal experiences and lessons learned',
        color: '#8B5CF6', // Purple
        targetPercentage: 15,
        postCount: 18,
        lastPostDate: '2024-01-12T14:20:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }
    ]

    const totalPosts = mockPillars.reduce((sum, pillar) => sum + pillar.postCount, 0)
    
    // Calculate analytics
    const topPerformingPillar = mockPillars.reduce((top, current) => 
      current.postCount > top.postCount ? current : top
    )

    return {
      pillars: mockPillars,
      totalPosts,
      analytics: {
        mostActiveMonth: 'January 2024',
        topPerformingPillar: topPerformingPillar.name,
        averagePostsPerPillar: Math.round(totalPosts / mockPillars.length),
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