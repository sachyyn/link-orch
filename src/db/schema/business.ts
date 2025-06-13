import { pgTable, varchar, text, timestamp, boolean, integer, uuid, pgEnum, jsonb, decimal, date } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { users } from './users'
import { contentPosts } from './content'

// Event status enum
export const eventStatusEnum = pgEnum('event_status', ['draft', 'published', 'ongoing', 'completed', 'cancelled'])

// Event type enum
export const eventTypeEnum = pgEnum('event_type', ['webinar', 'workshop', 'conference', 'networking', 'interview', 'meeting'])

// Lead status enum
export const leadStatusEnum = pgEnum('lead_status', ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'])

// Lead source enum
export const leadSourceEnum = pgEnum('lead_source', ['linkedin_post', 'linkedin_message', 'event', 'referral', 'website', 'other'])

// Events - LinkedIn events and professional gatherings
export const events = pgTable('events', {
  id: uuid('id').primaryKey().$defaultFn(() => sql`gen_random_uuid()`),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Event details
  title: varchar('title', { length: 300 }).notNull(),
  description: text('description'),
  eventType: eventTypeEnum('event_type').notNull(),
  status: eventStatusEnum('status').default('draft').notNull(),
  
  // Scheduling
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  timezone: varchar('timezone', { length: 100 }).default('UTC'),
  
  // Location and access
  isVirtual: boolean('is_virtual').default(true).notNull(),
  location: varchar('location', { length: 500 }),
  meetingUrl: varchar('meeting_url', { length: 500 }),
  accessCode: varchar('access_code', { length: 50 }),
  
  // Capacity and pricing
  maxAttendees: integer('max_attendees'),
  currentAttendees: integer('current_attendees').default(0),
  isFree: boolean('is_free').default(true).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).default('0.00'),
  currency: varchar('currency', { length: 3 }).default('USD'),
  
  // LinkedIn integration
  linkedinEventId: varchar('linkedin_event_id', { length: 100 }),
  linkedinEventUrl: varchar('linkedin_event_url', { length: 500 }),
  promotionPostId: uuid('promotion_post_id').references(() => contentPosts.id),
  
  // Event content
  agenda: jsonb('agenda'), // Array of {time, topic, speaker}
  speakers: jsonb('speakers'), // Array of speaker information
  materials: jsonb('materials'), // Array of materials/resources
  
  // Settings
  requiresApproval: boolean('requires_approval').default(false),
  allowWaitlist: boolean('allow_waitlist').default(true),
  sendReminders: boolean('send_reminders').default(true),
  
  // Analytics
  totalViews: integer('total_views').default(0),
  totalRegistrations: integer('total_registrations').default(0),
  totalAttendance: integer('total_attendance').default(0),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Event attendees - people registered for events
export const eventAttendees = pgTable('event_attendees', {
  id: uuid('id').primaryKey().$defaultFn(() => sql`gen_random_uuid()`),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 255 }).references(() => users.id, { onDelete: 'cascade' }),
  
  // Attendee information (for external attendees)
  name: varchar('name', { length: 200 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  company: varchar('company', { length: 200 }),
  jobTitle: varchar('job_title', { length: 200 }),
  linkedinProfile: varchar('linkedin_profile', { length: 500 }),
  
  // Registration details
  registrationStatus: varchar('registration_status', { length: 50 }).default('registered'), // registered, waitlisted, approved, declined
  attendanceStatus: varchar('attendance_status', { length: 50 }).default('pending'), // pending, attended, no_show
  
  // Engagement
  questionsAsked: integer('questions_asked').default(0),
  engagementScore: decimal('engagement_score', { precision: 5, scale: 2 }).default('0.00'),
  feedback: text('feedback'),
  rating: integer('rating'), // 1-5 stars
  
  // Metadata
  registrationSource: varchar('registration_source', { length: 100 }),
  specialRequests: text('special_requests'),
  
  registeredAt: timestamp('registered_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Leads - potential business opportunities
export const leads = pgTable('leads', {
  id: uuid('id').primaryKey().$defaultFn(() => sql`gen_random_uuid()`),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Lead information
  name: varchar('name', { length: 200 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  company: varchar('company', { length: 200 }),
  jobTitle: varchar('job_title', { length: 200 }),
  linkedinProfile: varchar('linkedin_profile', { length: 500 }),
  
  // Lead classification
  status: leadStatusEnum('status').default('new').notNull(),
  source: leadSourceEnum('source').notNull(),
  priority: varchar('priority', { length: 20 }).default('medium'), // low, medium, high
  
  // Business context
  estimatedValue: decimal('estimated_value', { precision: 12, scale: 2 }),
  currency: varchar('currency', { length: 3 }).default('USD'),
  projectDescription: text('project_description'),
  budget: varchar('budget', { length: 100 }),
  timeline: varchar('timeline', { length: 100 }),
  
  // Interaction tracking
  firstContactDate: date('first_contact_date'),
  lastContactDate: date('last_contact_date'),
  nextFollowUpDate: date('next_follow_up_date'),
  totalInteractions: integer('total_interactions').default(0),
  
  // Source tracking
  sourcePostId: uuid('source_post_id').references(() => contentPosts.id),
  sourceEventId: uuid('source_event_id').references(() => events.id),
  referrerName: varchar('referrer_name', { length: 200 }),
  
  // Lead scoring
  leadScore: integer('lead_score').default(0), // 0-100
  qualificationNotes: text('qualification_notes'),
  
  // Tags and categorization
  tags: jsonb('tags'), // Array of tags
  industry: varchar('industry', { length: 100 }),
  companySize: varchar('company_size', { length: 50 }),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Lead interactions - track all touchpoints with leads
export const leadInteractions = pgTable('lead_interactions', {
  id: uuid('id').primaryKey().$defaultFn(() => sql`gen_random_uuid()`),
  leadId: uuid('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Interaction details
  interactionType: varchar('interaction_type', { length: 50 }).notNull(), // email, call, meeting, linkedin_message, etc.
  direction: varchar('direction', { length: 20 }).notNull(), // inbound, outbound
  subject: varchar('subject', { length: 300 }),
  content: text('content'),
  
  // Outcome
  outcome: varchar('outcome', { length: 100 }), // positive, neutral, negative, no_response
  nextAction: text('next_action'),
  
  // Metadata
  duration: integer('duration'), // in minutes
  attachments: jsonb('attachments'), // Array of attachment URLs
  
  interactionDate: timestamp('interaction_date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Campaigns - marketing campaigns and outreach
export const campaigns = pgTable('campaigns', {
  id: uuid('id').primaryKey().$defaultFn(() => sql`gen_random_uuid()`),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Campaign details
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  campaignType: varchar('campaign_type', { length: 50 }).notNull(), // content_series, lead_generation, brand_awareness
  
  // Status and timing
  status: varchar('status', { length: 50 }).default('draft'), // draft, active, paused, completed
  startDate: date('start_date'),
  endDate: date('end_date'),
  
  // Goals and metrics
  primaryGoal: varchar('primary_goal', { length: 100 }),
  targetAudience: text('target_audience'),
  successMetrics: jsonb('success_metrics'), // Array of KPIs
  
  // Budget and resources
  budget: decimal('budget', { precision: 10, scale: 2 }),
  currency: varchar('currency', { length: 3 }).default('USD'),
  
  // Performance tracking
  totalReach: integer('total_reach').default(0),
  totalEngagement: integer('total_engagement').default(0),
  totalLeads: integer('total_leads').default(0),
  totalConversions: integer('total_conversions').default(0),
  
  // Content and materials
  contentPieces: jsonb('content_pieces'), // Array of content used in campaign
  landingPages: jsonb('landing_pages'), // Array of landing page URLs
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Services - professional services offered
export const services = pgTable('services', {
  id: uuid('id').primaryKey().$defaultFn(() => sql`gen_random_uuid()`),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Service details
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }), // consulting, coaching, training, etc.
  
  // Pricing
  priceType: varchar('price_type', { length: 50 }), // fixed, hourly, project_based, custom
  basePrice: decimal('base_price', { precision: 10, scale: 2 }),
  currency: varchar('currency', { length: 3 }).default('USD'),
  
  // Service delivery
  deliveryMethod: varchar('delivery_method', { length: 50 }), // remote, onsite, hybrid
  duration: varchar('duration', { length: 100 }), // e.g., "2 hours", "1 week", "ongoing"
  
  // Availability and settings
  isActive: boolean('is_active').default(true),
  requiresConsultation: boolean('requires_consultation').default(true),
  maxClientsPerMonth: integer('max_clients_per_month'),
  
  // Content and materials
  packageIncludes: jsonb('package_includes'), // Array of included items
  prerequisites: text('prerequisites'),
  targetAudience: text('target_audience'),
  
  // Analytics
  totalInquiries: integer('total_inquiries').default(0),
  totalBookings: integer('total_bookings').default(0),
  avgRating: decimal('avg_rating', { precision: 3, scale: 2 }).default('0.00'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Export types for TypeScript
export type Event = typeof events.$inferSelect
export type NewEvent = typeof events.$inferInsert
export type EventAttendee = typeof eventAttendees.$inferSelect
export type NewEventAttendee = typeof eventAttendees.$inferInsert
export type Lead = typeof leads.$inferSelect
export type NewLead = typeof leads.$inferInsert
export type LeadInteraction = typeof leadInteractions.$inferSelect
export type NewLeadInteraction = typeof leadInteractions.$inferInsert
export type Campaign = typeof campaigns.$inferSelect
export type NewCampaign = typeof campaigns.$inferInsert
export type Service = typeof services.$inferSelect
export type NewService = typeof services.$inferInsert 