import { pgTable, varchar, text, timestamp, boolean, jsonb, serial, pgEnum } from 'drizzle-orm/pg-core'

// User role enum
export const userRoleEnum = pgEnum('user_role', ['free', 'pro', 'enterprise', 'admin'])

// User subscription status enum
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'cancelled', 'expired', 'trial'])

// Primary users table (synced with Clerk)
export const users = pgTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(), // Clerk user ID
  email: varchar('email', { length: 255 }).notNull().unique(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  imageUrl: varchar('image_url', { length: 500 }),
  role: userRoleEnum('role').default('free').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Extended user profiles with LinkedIn-specific information
export const userProfiles = pgTable('user_profiles', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Onboarding data
  jobTitle: varchar('job_title', { length: 200 }),
  company: varchar('company', { length: 200 }),
  linkedinUrl: varchar('linkedin_url', { length: 500 }),
  primaryGoal: varchar('primary_goal', { length: 100 }), // thought-leadership, network-growth, etc.
  
  // LinkedIn profile data
  linkedinUsername: varchar('linkedin_username', { length: 100 }),
  followerCount: varchar('follower_count', { length: 50 }),
  connectionCount: varchar('connection_count', { length: 50 }),
  
  // Profile preferences
  bio: text('bio'),
  expertise: jsonb('expertise'), // Array of expertise areas
  interests: jsonb('interests'), // Array of interests
  
  // Onboarding completion
  onboardingCompleted: boolean('onboarding_completed').default(false).notNull(),
  onboardingCompletedAt: timestamp('onboarding_completed_at'),
  
  // Profile settings
  timezone: varchar('timezone', { length: 100 }).default('UTC'),
  language: varchar('language', { length: 10 }).default('en'),
  
  // Notification preferences
  emailNotifications: boolean('email_notifications').default(true),
  pushNotifications: boolean('push_notifications').default(true),
  weeklyDigest: boolean('weekly_digest').default(true),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// User subscription information
export const userSubscriptions = pgTable('user_subscriptions', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Subscription details
  status: subscriptionStatusEnum('status').default('trial').notNull(),
  planType: varchar('plan_type', { length: 50 }).notNull(), // free, pro, enterprise
  billingPeriod: varchar('billing_period', { length: 20 }), // monthly, yearly
  
  // Dates
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  trialEndDate: timestamp('trial_end_date'),
  
  // Payment information
  stripeCustomerId: varchar('stripe_customer_id', { length: 100 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 100 }),
  
  // Usage limits
  monthlyPostLimit: varchar('monthly_post_limit', { length: 10 }).default('10'),
  monthlyPostsUsed: varchar('monthly_posts_used', { length: 10 }).default('0'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Export types for TypeScript
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type UserProfile = typeof userProfiles.$inferSelect
export type NewUserProfile = typeof userProfiles.$inferInsert
export type UserSubscription = typeof userSubscriptions.$inferSelect
export type NewUserSubscription = typeof userSubscriptions.$inferInsert 