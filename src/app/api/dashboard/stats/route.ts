import { createGetHandler } from '@/lib/api-wrapper'

// Dashboard statistics response type
interface DashboardStats {
  totalPosts: number
  publishedPosts: number
  scheduledPosts: number
  draftPosts: number
  totalPillars: number
  profileCompletion: number
  lastPostDate: string | null
  upcomingPosts: number
}

/**
 * GET /api/dashboard/stats
 * 
 * Returns dashboard statistics for the authenticated user
 * This endpoint demonstrates our new API foundation:
 * - Authentication required
 * - Input sanitization
 * - Error handling
 * - Consistent response format
 * 
 * Note: This is a simplified version with mock data for demonstration.
 * Real database queries will be implemented when building actual endpoints.
 */
export const GET = createGetHandler<never, DashboardStats>(
  async ({ userId }) => {
    if (!userId) {
      throw new Error('User ID is required')
    }

    // Mock data for demonstration - replace with real DB queries later
    // This demonstrates the API structure without complex database type issues
    const mockStats: DashboardStats = {
      totalPosts: 15,
      publishedPosts: 8,
      scheduledPosts: 3,
      draftPosts: 4,
      totalPillars: 4,
      profileCompletion: 75,
      lastPostDate: new Date().toISOString(),
      upcomingPosts: 2,
    }

    return mockStats
  },
  {
    requireAuth: true,
    sanitizeInput: true,
    enableLogging: process.env.NODE_ENV === 'development',
  }
) 