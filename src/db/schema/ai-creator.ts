import { pgTable, varchar, text, timestamp, boolean, uuid, integer, pgEnum } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { users } from './users'

// ================================
// AI Creator Enums
// ================================

// Content tone options for projects
export const contentToneEnum = pgEnum('content_tone', [
  'professional', 
  'casual', 
  'thought-leader', 
  'provocative', 
  'educational',
  'inspirational',
  'conversational',
  'custom'
])

// Content types that can be generated
export const contentTypeEnum = pgEnum('content_type', [
  'text-post',
  'carousel', 
  'video-script',
  'poll',
  'article',
  'story',
  'announcement'
])

// Post session status tracking
export const sessionStatusEnum = pgEnum('session_status', [
  'ideation',
  'generating', 
  'asset-creation',
  'ready',
  'completed',
  'archived'
])

// AI action types for usage tracking
export const aiActionTypeEnum = pgEnum('ai_action_type', [
  'content_generation',
  'content_regeneration', 
  'image_generation',
  'content_refinement',
  'asset_creation'
])

// Asset types that can be generated
export const assetTypeEnum = pgEnum('asset_type', [
  'image',
  'carousel',
  'infographic', 
  'banner',
  'thumbnail',
  'logo',
  'chart'
])

// ================================
// Core AI Creator Tables
// ================================

/**
 * AI Creator Projects - Main container for user's content projects
 * Each project represents a content strategy with specific guidelines
 */
export const aiProjects = pgTable('ai_projects', {
  id: uuid('id').primaryKey().$defaultFn(() => sql`gen_random_uuid()`),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Project identity
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'), // Optional project description
  
  // Content configuration
  tone: contentToneEnum('tone').default('professional').notNull(),
  contentTypes: varchar('content_types', { length: 500 }).notNull(), // JSON array of content types
  
  // Detailed content guidelines and strategy
  guidelines: text('guidelines').notNull(), // Comprehensive content blueprint
  targetAudience: text('target_audience'), // Who the content is for
  keyTopics: text('key_topics'), // Main topics/themes to cover
  brandVoice: text('brand_voice'), // Specific brand voice guidelines
  contentPillars: text('content_pillars'), // Content pillar definitions
  
  // Project settings
  isActive: boolean('is_active').default(true).notNull(),
  defaultModel: varchar('default_model', { length: 100 }).default('gemini-2.0-flash-exp'), // Default AI model
  
  // Usage statistics
  totalSessions: integer('total_sessions').default(0).notNull(),
  totalPosts: integer('total_posts').default(0).notNull(),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

/**
 * AI Post Sessions - Individual post creation sessions within projects
 * Each session represents one post ideation and generation cycle
 */
export const aiPostSessions = pgTable('ai_post_sessions', {
  id: uuid('id').primaryKey().$defaultFn(() => sql`gen_random_uuid()`),
  projectId: uuid('project_id').notNull().references(() => aiProjects.id, { onDelete: 'cascade' }),
  
  // Session content
  postIdea: text('post_idea').notNull(), // User's initial post idea
  additionalContext: text('additional_context'), // Extra context provided by user
  targetContentType: contentTypeEnum('target_content_type').default('text-post').notNull(),
  
  // Session configuration  
  selectedModel: varchar('selected_model', { length: 100 }).notNull(), // AI model used for generation
  customPrompt: text('custom_prompt'), // Any custom prompt additions
  
  // Session status and workflow
  status: sessionStatusEnum('status').default('ideation').notNull(),
  currentStep: varchar('current_step', { length: 50 }).default('ideation'), // Current workflow step
  
  // Generation results
  totalVersions: integer('total_versions').default(0).notNull(),
  selectedVersionId: uuid('selected_version_id'), // Reference to chosen content version
  
  // Asset generation
  needsAsset: boolean('needs_asset').default(false),
  assetGenerated: boolean('asset_generated').default(false),
  
  // Final output tracking
  finalContent: text('final_content'), // The final selected/edited content
  isCompleted: boolean('is_completed').default(false),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

/**
 * AI Content Versions - Multiple generated versions for each session
 * Stores different AI-generated content variations for user selection
 */
export const aiContentVersions = pgTable('ai_content_versions', {
  id: uuid('id').primaryKey().$defaultFn(() => sql`gen_random_uuid()`),
  sessionId: uuid('session_id').notNull().references(() => aiPostSessions.id, { onDelete: 'cascade' }),
  
  // Version tracking
  versionNumber: integer('version_number').notNull(), // 1, 2, 3, etc.
  generationBatch: integer('generation_batch').default(1), // Multiple batches can be generated
  
  // Generated content
  content: text('content').notNull(), // The actual generated content
  contentLength: integer('content_length'), // Character count
  estimatedReadTime: integer('estimated_read_time'), // In seconds
  
  // Content metadata
  hashtags: varchar('hashtags', { length: 500 }), // Extracted/suggested hashtags
  mentions: varchar('mentions', { length: 500 }), // Suggested mentions
  callToAction: text('call_to_action'), // Identified CTA
  
  // AI generation details
  modelUsed: varchar('model_used', { length: 100 }).notNull(),
  tokensUsed: integer('tokens_used'), // API usage tracking
  generationTime: integer('generation_time'), // Time taken in milliseconds
  prompt: text('prompt'), // Full prompt used for generation
  
  // User interaction
  isSelected: boolean('is_selected').default(false),
  userRating: integer('user_rating'), // 1-5 star rating from user
  userFeedback: text('user_feedback'), // User notes/feedback
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

/**
 * AI Generated Assets - Images, carousels, and other visual content
 * Stores generated visual assets linked to post sessions
 */
export const aiGeneratedAssets = pgTable('ai_generated_assets', {
  id: uuid('id').primaryKey().$defaultFn(() => sql`gen_random_uuid()`),
  sessionId: uuid('session_id').notNull().references(() => aiPostSessions.id, { onDelete: 'cascade' }),
  
  // Asset details
  assetType: assetTypeEnum('asset_type').notNull(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileUrl: varchar('file_url', { length: 500 }).notNull(), // Storage URL
  fileSize: integer('file_size'), // File size in bytes
  
  // Generation details
  prompt: text('prompt').notNull(), // Prompt used for asset generation
  model: varchar('model', { length: 100 }), // AI model used (if different from content)
  style: varchar('style', { length: 100 }), // Image style/format
  dimensions: varchar('dimensions', { length: 50 }), // e.g., "1080x1080"
  
  // Generation metadata
  generationTime: integer('generation_time'), // Time taken in milliseconds
  generationCost: varchar('generation_cost', { length: 20 }), // API cost tracking
  
  // Asset status
  isSelected: boolean('is_selected').default(false),
  isDownloaded: boolean('is_downloaded').default(false),
  downloadCount: integer('download_count').default(0),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

/**
 * AI Usage Logs - Track AI API usage and costs
 * Comprehensive logging for analytics and billing
 */
export const aiUsageLogs = pgTable('ai_usage_logs', {
  id: uuid('id').primaryKey().$defaultFn(() => sql`gen_random_uuid()`),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Optional associations
  projectId: uuid('project_id').references(() => aiProjects.id, { onDelete: 'set null' }),
  sessionId: uuid('session_id').references(() => aiPostSessions.id, { onDelete: 'set null' }),
  
  // Action details
  actionType: aiActionTypeEnum('action_type').notNull(),
  modelUsed: varchar('model_used', { length: 100 }).notNull(),
  
  // Usage metrics
  tokensUsed: integer('tokens_used'),
  processingTime: integer('processing_time'), // Time in milliseconds
  apiCost: varchar('api_cost', { length: 20 }), // Cost tracking
  
  // Request/Response data
  requestPayload: text('request_payload'), // Store request for debugging
  responseSize: integer('response_size'), // Response size in bytes
  
  // Status tracking
  isSuccessful: boolean('is_successful').default(true),
  errorMessage: text('error_message'),
  retryCount: integer('retry_count').default(0),
  
  // Context metadata
  userAgent: varchar('user_agent', { length: 500 }),
  ipAddress: varchar('ip_address', { length: 45 }),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ================================
// Type Exports
// ================================

// Core table types
export type AIProject = typeof aiProjects.$inferSelect
export type NewAIProject = typeof aiProjects.$inferInsert

export type AIPostSession = typeof aiPostSessions.$inferSelect
export type NewAIPostSession = typeof aiPostSessions.$inferInsert

export type AIContentVersion = typeof aiContentVersions.$inferSelect
export type NewAIContentVersion = typeof aiContentVersions.$inferInsert

export type AIGeneratedAsset = typeof aiGeneratedAssets.$inferSelect
export type NewAIGeneratedAsset = typeof aiGeneratedAssets.$inferInsert

export type AIUsageLog = typeof aiUsageLogs.$inferSelect
export type NewAIUsageLog = typeof aiUsageLogs.$inferInsert

// ================================
// Input Types for API/Service Layer
// ================================

// Simplified input types that exclude auto-generated fields
export type CreateProjectInput = Omit<NewAIProject, 'id' | 'userId' | 'totalSessions' | 'totalPosts' | 'createdAt' | 'updatedAt'>

export type CreateSessionInput = Omit<NewAIPostSession, 'id' | 'totalVersions' | 'createdAt' | 'updatedAt'>

export type CreateContentVersionInput = Omit<NewAIContentVersion, 'id' | 'createdAt'>

export type CreateAssetInput = Omit<NewAIGeneratedAsset, 'id' | 'downloadCount' | 'createdAt'>

export type CreateUsageLogInput = Omit<NewAIUsageLog, 'id' | 'retryCount' | 'createdAt'> 