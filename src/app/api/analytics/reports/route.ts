import { createGetHandler, createPostHandler } from '@/lib/api-wrapper'
import { z } from 'zod'

// Validation schema for report configuration
const reportConfigSchema = z.object({
  type: z.enum(['performance', 'engagement', 'growth', 'comprehensive']),
  period: z.object({
    start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  }),
  metrics: z.array(z.string()),
  groupBy: z.enum(['day', 'week', 'month']).optional(),
  includeComparisons: z.boolean().optional(),
  format: z.enum(['json', 'csv', 'pdf']).optional(),
})

// Types for analytics reports
interface ReportConfig {
  type: 'performance' | 'engagement' | 'growth' | 'comprehensive'
  period: {
    start: string // ISO date
    end: string   // ISO date
  }
  metrics: string[] // Array of metric names to include
  groupBy?: 'day' | 'week' | 'month'
  includeComparisons?: boolean
  format?: 'json' | 'csv' | 'pdf'
}

interface PerformanceReport {
  metadata: {
    reportId: string
    type: string
    generatedAt: string
    period: {
      start: string
      end: string
    }
    totalDays: number
  }
  summary: {
    totalPosts: number
    totalImpressions: number
    totalEngagement: number
    averageEngagementRate: number
    topPerformingPost: {
      postId: number
      title: string
      impressions: number
      engagementRate: number
    }
    bestPerformingDay: {
      date: string
      impressions: number
      engagement: number
    }
  }
  metrics: {
    daily: Array<{
      date: string
      posts: number
      impressions: number
      engagement: number
      engagementRate: number
      profileViews: number
      followerGrowth: number
    }>
    totals: {
      impressions: number
      engagement: number
      profileViews: number
      followerGrowth: number
    }
    averages: {
      dailyImpressions: number
      dailyEngagement: number
      engagementRate: number
    }
  }
  pillars: Array<{
    pillarId: number
    pillarName: string
    postCount: number
    impressions: number
    engagement: number
    engagementRate: number
    targetPercentage: number
    actualPercentage: number
  }>
  recommendations: Array<{
    category: 'content' | 'timing' | 'engagement' | 'growth'
    priority: 'high' | 'medium' | 'low'
    title: string
    description: string
    expectedImpact: string
  }>
  exportUrl?: string // URL for downloading the report
}

interface ReportListResponse {
  reports: Array<{
    reportId: string
    type: string
    period: { start: string; end: string }
    generatedAt: string
    status: 'generating' | 'ready' | 'failed'
    downloadUrl?: string
  }>
  canGenerate: boolean
  monthlyLimit: number
  used: number
}

/**
 * GET /api/analytics/reports
 * 
 * Lists all generated reports for the user
 * Includes report status and download links
 */
export const GET = createGetHandler<never, ReportListResponse>(
  async ({ userId }) => {
    // Mock reports list
    const mockReports: ReportListResponse = {
      reports: [
        {
          reportId: 'rpt_2024_01_monthly',
          type: 'comprehensive',
          period: { start: '2024-01-01', end: '2024-01-31' },
          generatedAt: '2024-02-01T09:00:00Z',
          status: 'ready',
          downloadUrl: '/api/analytics/reports/rpt_2024_01_monthly/download',
        },
        {
          reportId: 'rpt_2024_01_week3',
          type: 'performance',
          period: { start: '2024-01-15', end: '2024-01-21' },
          generatedAt: '2024-01-22T14:30:00Z',
          status: 'ready',
          downloadUrl: '/api/analytics/reports/rpt_2024_01_week3/download',
        },
        {
          reportId: 'rpt_2024_01_growth',
          type: 'growth',
          period: { start: '2024-01-01', end: '2024-01-15' },
          generatedAt: '2024-01-16T11:15:00Z',
          status: 'ready',
          downloadUrl: '/api/analytics/reports/rpt_2024_01_growth/download',
        },
        {
          reportId: 'rpt_2024_02_generating',
          type: 'engagement',
          period: { start: '2024-02-01', end: '2024-02-07' },
          generatedAt: '2024-02-08T10:45:00Z',
          status: 'generating',
        },
      ],
      canGenerate: true,
      monthlyLimit: 10,
      used: 4,
    }

    return mockReports
  },
  {
    requireAuth: true,
    sanitizeInput: true,
    enableLogging: process.env.NODE_ENV === 'development',
  }
)

/**
 * POST /api/analytics/reports
 * 
 * Generates a new analytics report
 * Supports various report types and customization options
 */
export const POST = createPostHandler<ReportConfig, PerformanceReport>(
  async ({ userId, body }) => {
    const config = body

    // Validate date range (Zod handles required field validation)
    const startDate = new Date(config.period.start)
    const endDate = new Date(config.period.end)
    
    if (startDate >= endDate) {
      throw new Error('End date must be after start date')
    }

    // Validate period length (max 365 days)
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    if (daysDiff > 365) {
      throw new Error('Report period cannot exceed 365 days')
    }

    // Mock report generation
    const reportId = `rpt_${Date.now()}_${config.type}`
    
    const mockReport: PerformanceReport = {
      metadata: {
        reportId,
        type: config.type,
        generatedAt: new Date().toISOString(),
        period: {
          start: config.period.start,
          end: config.period.end,
        },
        totalDays: daysDiff,
      },
      summary: {
        totalPosts: 28,
        totalImpressions: 187500,
        totalEngagement: 5680,
        averageEngagementRate: 3.03,
        topPerformingPost: {
          postId: 1,
          title: "Building a Strong LinkedIn Presence",
          impressions: 15750,
          engagementRate: 2.89,
        },
        bestPerformingDay: {
          date: '2024-01-15',
          impressions: 15750,
          engagement: 452,
        },
      },
      metrics: {
        daily: [
          { date: '2024-01-01', posts: 2, impressions: 8200, engagement: 245, engagementRate: 2.99, profileViews: 85, followerGrowth: 5 },
          { date: '2024-01-02', posts: 1, impressions: 9100, engagement: 287, engagementRate: 3.15, profileViews: 92, followerGrowth: 3 },
          { date: '2024-01-03', posts: 1, impressions: 7800, engagement: 234, engagementRate: 3.00, profileViews: 78, followerGrowth: 2 },
          { date: '2024-01-04', posts: 2, impressions: 10500, engagement: 312, engagementRate: 2.97, profileViews: 105, followerGrowth: 7 },
          { date: '2024-01-05', posts: 1, impressions: 11200, engagement: 345, engagementRate: 3.08, profileViews: 118, followerGrowth: 6 },
        ],
        totals: {
          impressions: 187500,
          engagement: 5680,
          profileViews: 1240,
          followerGrowth: 156,
        },
        averages: {
          dailyImpressions: 6696,
          dailyEngagement: 203,
          engagementRate: 3.03,
        },
      },
      pillars: [
        {
          pillarId: 1,
          pillarName: 'Thought Leadership',
          postCount: 12,
          impressions: 78000,
          engagement: 2340,
          engagementRate: 3.00,
          targetPercentage: 40,
          actualPercentage: 42.9,
        },
        {
          pillarId: 2,
          pillarName: 'Company Culture',
          postCount: 8,
          impressions: 52000,
          engagement: 1560,
          engagementRate: 3.00,
          targetPercentage: 25,
          actualPercentage: 28.6,
        },
        {
          pillarId: 3,
          pillarName: 'Educational Content',
          postCount: 6,
          impressions: 39000,
          engagement: 1170,
          engagementRate: 3.00,
          targetPercentage: 20,
          actualPercentage: 21.4,
        },
        {
          pillarId: 4,
          pillarName: 'Personal Stories',
          postCount: 2,
          impressions: 18500,
          engagement: 610,
          engagementRate: 3.30,
          targetPercentage: 15,
          actualPercentage: 7.1,
        },
      ],
      recommendations: [
        {
          category: 'content',
          priority: 'high',
          title: 'Increase Personal Stories Content',
          description: 'Your Personal Stories pillar is underperforming allocation targets (7.1% vs 15% target) but shows highest engagement rate (3.30%).',
          expectedImpact: 'Could increase overall engagement by 8-12%',
        },
        {
          category: 'timing',
          priority: 'medium',
          title: 'Optimize Posting Schedule',
          description: 'Posts published between 9-11 AM show 34% higher engagement than other times.',
          expectedImpact: 'Could increase reach by 15-25%',
        },
        {
          category: 'engagement',
          priority: 'medium',
          title: 'Improve Comment Response Rate',
          description: 'Currently responding to 67% of comments. Increasing to 85%+ could boost algorithm visibility.',
          expectedImpact: 'Could increase subsequent post reach by 20%',
        },
        {
          category: 'growth',
          priority: 'low',
          title: 'Experiment with Video Content',
          description: 'Video posts in your industry average 45% more profile views than text posts.',
          expectedImpact: 'Could increase follower growth rate by 10-15%',
        },
      ],
      exportUrl: `/api/analytics/reports/${reportId}/download`,
    }

    return mockReport
  },
  {
    bodySchema: reportConfigSchema,
    requireAuth: true,
    sanitizeInput: true,
    enableLogging: process.env.NODE_ENV === 'development',
  }
) 