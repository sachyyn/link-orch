import { pgTable, varchar, text, timestamp, boolean, integer, serial, pgEnum, jsonb } from 'drizzle-orm/pg-core'
import { users } from './users'

// Post status enum
export const postStatusEnum = pgEnum('post_status', ['draft', 'scheduled', 'published', 'failed', 'archived'])

// Post type enum
export const postTypeEnum = pgEnum('post_type', ['text', 'image', 'video', 'document', 'poll', 'article'])

// Content pillars - thematic categories for organizing content
export const contentPillars = pgTable('content_pillars', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Pillar details
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  color: varchar('color', { length: 7 }).default('#000000'), // Hex color code
  icon: varchar('icon', { length: 50 }), // Icon name or emoji
  
  // Analytics
  postCount: integer('post_count').default(0),
  totalEngagement: integer('total_engagement').default(0),
  avgEngagement: integer('avg_engagement').default(0),
  
  // Settings
  isActive: boolean('is_active').default(true),
  sortOrder: integer('sort_order').default(0),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Content posts - LinkedIn posts and articles
export const contentPosts = pgTable('content_posts', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  pillarId: integer('pillar_id').references(() => contentPillars.id, { onDelete: 'set null' }),
  
  // Post content
  title: varchar('title', { length: 500 }),
  content: text('content').notNull(),
  postType: postTypeEnum('post_type').default('text').notNull(),
  
  // Media attachments
  mediaUrls: jsonb('media_urls'), // Array of image/video URLs
  documentUrls: jsonb('document_urls'), // Array of document URLs
  
  // Hashtags and mentions
  hashtags: jsonb('hashtags'), // Array of hashtags
  mentions: jsonb('mentions'), // Array of user mentions
  
  // Scheduling
  status: postStatusEnum('status').default('draft').notNull(),
  scheduledAt: timestamp('scheduled_at'),
  publishedAt: timestamp('published_at'),
  
  // LinkedIn specific
  linkedinPostId: varchar('linkedin_post_id', { length: 100 }), // LinkedIn post ID after publishing
  linkedinPostUrl: varchar('linkedin_post_url', { length: 500 }), // LinkedIn post URL
  
  // Engagement metrics (cached from analytics)
  likeCount: integer('like_count').default(0),
  commentCount: integer('comment_count').default(0),
  shareCount: integer('share_count').default(0),
  impressionCount: integer('impression_count').default(0),
  
  // Metadata
  sourceTemplate: varchar('source_template', { length: 100 }), // If created from template
  aiGenerated: boolean('ai_generated').default(false),
  notes: text('notes'), // Internal notes about the post
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Content templates - reusable post templates
export const contentTemplates = pgTable('content_templates', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  pillarId: integer('pillar_id').references(() => contentPillars.id, { onDelete: 'set null' }),
  
  // Template details
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  template: text('template').notNull(), // Template content with placeholders
  postType: postTypeEnum('post_type').default('text').notNull(),
  
  // Template settings
  isPublic: boolean('is_public').default(false), // Can be shared with other users
  usageCount: integer('usage_count').default(0),
  tags: jsonb('tags'), // Array of tags for categorization
  
  // Default settings for posts created from this template
  defaultHashtags: jsonb('default_hashtags'),
  defaultPillar: integer('default_pillar_id').references(() => contentPillars.id),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Content calendar - scheduled content planning
export const contentCalendar = pgTable('content_calendar', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  postId: integer('post_id').references(() => contentPosts.id, { onDelete: 'cascade' }),
  
  // Calendar details
  title: varchar('title', { length: 300 }).notNull(),
  date: timestamp('date').notNull(),
  timeSlot: varchar('time_slot', { length: 20 }), // morning, afternoon, evening
  
  // Status and planning
  status: varchar('status', { length: 50 }).default('planned'), // planned, assigned, completed
  priority: varchar('priority', { length: 20 }).default('medium'), // low, medium, high
  
  // Content planning
  pillarId: integer('pillar_id').references(() => contentPillars.id),
  contentIdeas: jsonb('content_ideas'), // Array of content ideas
  notes: text('notes'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Content drafts - work in progress content
export const contentDrafts = pgTable('content_drafts', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Draft content
  title: varchar('title', { length: 500 }),
  content: text('content'),
  postType: postTypeEnum('post_type').default('text'),
  
  // Metadata
  autoSaveData: jsonb('auto_save_data'), // Auto-saved form data
  lastEditedAt: timestamp('last_edited_at').defaultNow(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Export types for TypeScript
export type ContentPillar = typeof contentPillars.$inferSelect
export type NewContentPillar = typeof contentPillars.$inferInsert
export type ContentPost = typeof contentPosts.$inferSelect
export type NewContentPost = typeof contentPosts.$inferInsert
export type ContentTemplate = typeof contentTemplates.$inferSelect
export type NewContentTemplate = typeof contentTemplates.$inferInsert
export type ContentCalendar = typeof contentCalendar.$inferSelect
export type NewContentCalendar = typeof contentCalendar.$inferInsert
export type ContentDraft = typeof contentDrafts.$inferSelect
export type NewContentDraft = typeof contentDrafts.$inferInsert 