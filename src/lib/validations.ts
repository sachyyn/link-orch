import { z } from 'zod'

// ================================
// User & Profile Validations
// ================================

export const userProfileSchema = z.object({
  jobTitle: z.string().min(1).max(200).optional(),
  company: z.string().min(1).max(200).optional(),
  linkedinUrl: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  primaryGoal: z.enum(['brand_building', 'lead_generation', 'networking', 'thought_leadership']).optional(),
  targetAudience: z.string().max(300).optional(),
  contentFrequency: z.enum(['daily', 'weekly', 'bi_weekly', 'monthly']).optional(),
})

export const updateUserProfileSchema = userProfileSchema.partial()

// ================================
// Content Management Validations
// ================================

export const contentPillarSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  targetPercentage: z.number().min(0).max(100).optional(),
})

export const updateContentPillarSchema = contentPillarSchema.partial()

export const contentPostSchema = z.object({
  title: z.string().min(1).max(500),
  content: z.string().min(1),
  status: z.enum(['draft', 'scheduled', 'published', 'archived']).default('draft'),
  scheduledAt: z.string().datetime().optional(),
  pillarId: z.number().optional(),
  hashtags: z.array(z.string()).max(30).optional(),
  mentions: z.array(z.string()).max(10).optional(),
  mediaUrls: z.array(z.string().url()).max(10).optional(),
})

export const updateContentPostSchema = contentPostSchema.partial()

export const contentTemplateSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  category: z.string().max(50).optional(),
  pillarId: z.number().optional(),
  isPublic: z.boolean().default(false),
})

export const updateContentTemplateSchema = contentTemplateSchema.partial()

// ================================
// Analytics Validations
// ================================

export const postAnalyticsSchema = z.object({
  postId: z.number(),
  impressions: z.number().min(0).default(0),
  likes: z.number().min(0).default(0),
  comments: z.number().min(0).default(0),
  shares: z.number().min(0).default(0),
  clickThroughRate: z.number().min(0).max(100).default(0),
  engagementRate: z.number().min(0).max(100).default(0),
  reach: z.number().min(0).default(0),
})

export const engagementMetricSchema = z.object({
  metricType: z.enum(['profile_view', 'post_engagement', 'follower_growth', 'message_response']),
  value: z.number(),
  date: z.string().datetime(),
  metadata: z.record(z.any()).optional(),
})

// ================================
// Business Logic Validations
// ================================

export const eventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  location: z.string().max(200).optional(),
  eventType: z.enum(['webinar', 'workshop', 'networking', 'conference', 'meetup']),
  maxAttendees: z.number().min(1).optional(),
  registrationUrl: z.string().url().optional(),
  status: z.enum(['planning', 'published', 'ongoing', 'completed', 'cancelled']).default('planning'),
})

export const updateEventSchema = eventSchema.partial()

export const leadSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  company: z.string().max(200).optional(),
  jobTitle: z.string().max(200).optional(),
  linkedinUrl: z.string().url().optional(),
  source: z.enum(['linkedin', 'email', 'event', 'referral', 'website', 'other']),
  status: z.enum(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']).default('new'),
  value: z.number().min(0).optional(),
  notes: z.string().max(1000).optional(),
})

export const updateLeadSchema = leadSchema.partial()

export const campaignSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  budget: z.number().min(0).optional(),
  objective: z.enum(['brand_awareness', 'lead_generation', 'engagement', 'traffic', 'conversions']),
  status: z.enum(['draft', 'active', 'paused', 'completed', 'cancelled']).default('draft'),
  targetAudience: z.string().max(500).optional(),
})

export const updateCampaignSchema = campaignSchema.partial()

export const serviceSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  category: z.string().max(100).optional(),
  price: z.number().min(0).optional(),
  currency: z.string().length(3).default('USD'),
  duration: z.string().max(100).optional(),
  isActive: z.boolean().default(true),
})

export const updateServiceSchema = serviceSchema.partial()

// ================================
// Query Parameter Validations
// ================================

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})

export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
})

export const contentFilterSchema = z.object({
  status: z.enum(['draft', 'scheduled', 'published', 'archived']).optional(),
  pillarId: z.coerce.number().optional(),
  search: z.string().max(100).optional(),
}).merge(paginationSchema).merge(dateRangeSchema)

export const analyticsFilterSchema = z.object({
  metricType: z.enum(['impressions', 'engagement', 'reach', 'growth']).optional(),
  period: z.enum(['day', 'week', 'month', 'quarter', 'year']).default('month'),
}).merge(dateRangeSchema)

// ================================
// API Response Schemas
// ================================

export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
})

export const paginatedResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(z.any()),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
  error: z.string().optional(),
}) 