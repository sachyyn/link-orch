import { pgTable, varchar, text, timestamp, integer, serial, jsonb, date, decimal } from 'drizzle-orm/pg-core'
import { users } from './users'
import { contentPosts, contentPillars } from './content'

// Post analytics - detailed metrics for each LinkedIn post
export const postAnalytics = pgTable('post_analytics', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  postId: integer('post_id').notNull().references(() => contentPosts.id, { onDelete: 'cascade' }),
  
  // LinkedIn metrics
  linkedinPostId: varchar('linkedin_post_id', { length: 100 }),
  
  // Engagement metrics
  impressions: integer('impressions').default(0),
  likes: integer('likes').default(0),
  comments: integer('comments').default(0),
  shares: integer('shares').default(0),
  clicks: integer('clicks').default(0),
  
  // Advanced metrics
  engagementRate: decimal('engagement_rate', { precision: 5, scale: 2 }).default('0.00'),
  clickThroughRate: decimal('click_through_rate', { precision: 5, scale: 2 }).default('0.00'),
  
  // Profile metrics (impact on profile)
  profileViews: integer('profile_views').default(0),
  newFollowers: integer('new_followers').default(0),
  newConnections: integer('new_connections').default(0),
  
  // Time-based metrics
  firstHourEngagement: integer('first_hour_engagement').default(0),
  firstDayEngagement: integer('first_day_engagement').default(0),
  peakEngagementTime: timestamp('peak_engagement_time'),
  
  // Audience insights
  topCountries: jsonb('top_countries'), // Array of {country, percentage}
  topIndustries: jsonb('top_industries'), // Array of {industry, percentage}
  audienceGrowth: integer('audience_growth').default(0),
  
  // Snapshot date for historical tracking
  snapshotDate: date('snapshot_date').notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Engagement metrics - detailed engagement tracking
export const engagementMetrics = pgTable('engagement_metrics', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  postId: integer('post_id').references(() => contentPosts.id, { onDelete: 'cascade' }),
  
  // Interaction details
  interactionType: varchar('interaction_type', { length: 50 }).notNull(), // like, comment, share, click
  interactionValue: text('interaction_value'), // comment text, click URL, etc.
  
  // User context (if available)
  interactorLinkedinId: varchar('interactor_linkedin_id', { length: 100 }),
  interactorName: varchar('interactor_name', { length: 200 }),
  interactorTitle: varchar('interactor_title', { length: 200 }),
  interactorCompany: varchar('interactor_company', { length: 200 }),
  
  // Timing
  interactionTime: timestamp('interaction_time').notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Performance snapshots - daily/weekly/monthly performance summaries
export const performanceSnapshots = pgTable('performance_snapshots', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Snapshot details
  snapshotType: varchar('snapshot_type', { length: 20 }).notNull(), // daily, weekly, monthly
  snapshotDate: date('snapshot_date').notNull(),
  
  // Overall metrics
  totalPosts: integer('total_posts').default(0),
  totalImpressions: integer('total_impressions').default(0),
  totalEngagement: integer('total_engagement').default(0),
  avgEngagementRate: decimal('avg_engagement_rate', { precision: 5, scale: 2 }).default('0.00'),
  
  // Growth metrics
  followerGrowth: integer('follower_growth').default(0),
  connectionGrowth: integer('connection_growth').default(0),
  profileViews: integer('profile_views').default(0),
  
  // Content performance
  topPerformingPost: integer('top_performing_post').references(() => contentPosts.id),
  topPerformingPillar: integer('top_performing_pillar').references(() => contentPillars.id),
  
  // Pillar breakdown
  pillarMetrics: jsonb('pillar_metrics'), // Array of {pillarId, posts, engagement}
  
  // Engagement breakdown by type
  likesBreakdown: integer('likes_breakdown').default(0),
  commentsBreakdown: integer('comments_breakdown').default(0),
  sharesBreakdown: integer('shares_breakdown').default(0),
  clicksBreakdown: integer('clicks_breakdown').default(0),
  
  // Time analysis
  bestPostingTimes: jsonb('best_posting_times'), // Array of {hour, day, engagement}
  engagementByDayOfWeek: jsonb('engagement_by_day_of_week'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// User activity - track user actions within the platform
export const userActivity = pgTable('user_activity', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Activity details
  activityType: varchar('activity_type', { length: 50 }).notNull(), // login, post_created, post_scheduled, etc.
  description: text('description'),
  metadata: jsonb('metadata'), // Additional context data
  
  // Context
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  referrer: varchar('referrer', { length: 500 }),
  
  // Related entities
  relatedPostId: integer('related_post_id').references(() => contentPosts.id),
  relatedPillarId: integer('related_pillar_id').references(() => contentPillars.id),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Analytics goals - user-defined performance goals
export const analyticsGoals = pgTable('analytics_goals', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Goal details
  goalType: varchar('goal_type', { length: 50 }).notNull(), // followers, engagement_rate, posts_per_week
  targetValue: integer('target_value').notNull(),
  currentValue: integer('current_value').default(0),
  
  // Time frame
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  
  // Status
  isActive: varchar('is_active', { length: 20 }).default('active'), // active, completed, paused
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Content insights - AI-generated insights about content performance
export const contentInsights = pgTable('content_insights', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Insight details
  insightType: varchar('insight_type', { length: 50 }).notNull(), // trend, recommendation, alert
  title: varchar('title', { length: 300 }).notNull(),
  description: text('description').notNull(),
  
  // Data and confidence
  dataPoints: jsonb('data_points'), // Supporting data for the insight
  confidenceScore: decimal('confidence_score', { precision: 3, scale: 2 }).default('0.00'),
  
  // Actions
  suggestedActions: jsonb('suggested_actions'), // Array of recommended actions
  isActionable: varchar('is_actionable', { length: 20 }).default('true'),
  
  // Status
  status: varchar('status', { length: 20 }).default('new'), // new, viewed, acted_on, dismissed
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Export types for TypeScript
export type PostAnalytics = typeof postAnalytics.$inferSelect
export type NewPostAnalytics = typeof postAnalytics.$inferInsert
export type EngagementMetrics = typeof engagementMetrics.$inferSelect
export type NewEngagementMetrics = typeof engagementMetrics.$inferInsert
export type PerformanceSnapshot = typeof performanceSnapshots.$inferSelect
export type NewPerformanceSnapshot = typeof performanceSnapshots.$inferInsert
export type UserActivity = typeof userActivity.$inferSelect
export type NewUserActivity = typeof userActivity.$inferInsert
export type AnalyticsGoals = typeof analyticsGoals.$inferSelect
export type NewAnalyticsGoals = typeof analyticsGoals.$inferInsert
export type ContentInsights = typeof contentInsights.$inferSelect
export type NewContentInsights = typeof contentInsights.$inferInsert 