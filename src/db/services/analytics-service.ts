import { db } from '@/db'
import { 
  contentPosts,
  eq, 
  and,
  count
} from '@/db/schema'
import { gte } from 'drizzle-orm'

// ================================
// Analytics Service (Simplified)
// ================================

export interface AnalyticsOverview {
  totalPosts: number
  totalImpressions: number
  totalEngagement: number
  avgEngagementRate: number
}

/**
 * Get basic analytics overview for a user
 */
export async function getAnalyticsOverview(
  userId: string, 
  period: '7d' | '30d' | '90d' | '1y' = '30d'
): Promise<AnalyticsOverview> {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // Get basic post counts and cached metrics
  const [result] = await db
    .select({ 
      count: count(),
      totalImpressions: contentPosts.impressionCount,
      totalLikes: contentPosts.likeCount,
      totalComments: contentPosts.commentCount,
      totalShares: contentPosts.shareCount
    })
    .from(contentPosts)
    .where(and(
      eq(contentPosts.userId, userId),
      gte(contentPosts.createdAt, startDate)
    ))

  const totalEngagement = (result.totalLikes || 0) + (result.totalComments || 0) + (result.totalShares || 0)
  const avgEngagementRate = result.totalImpressions ? (totalEngagement / result.totalImpressions) * 100 : 0

  return {
    totalPosts: result.count,
    totalImpressions: result.totalImpressions || 0,
    totalEngagement,
    avgEngagementRate: Number(avgEngagementRate.toFixed(2))
  }
} 