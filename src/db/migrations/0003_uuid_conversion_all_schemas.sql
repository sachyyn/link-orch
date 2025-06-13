-- Enable pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- USER PROFILES & SUBSCRIPTIONS CONVERSION
-- ============================================================================

-- Convert user_profiles table
ALTER TABLE "user_profiles" ADD COLUMN "new_id" uuid DEFAULT gen_random_uuid();
UPDATE "user_profiles" SET "new_id" = gen_random_uuid();
ALTER TABLE "user_profiles" DROP CONSTRAINT "user_profiles_pkey";
ALTER TABLE "user_profiles" DROP COLUMN "id";
ALTER TABLE "user_profiles" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "user_profiles" ADD PRIMARY KEY ("id");

-- Convert user_subscriptions table
ALTER TABLE "user_subscriptions" ADD COLUMN "new_id" uuid DEFAULT gen_random_uuid();
UPDATE "user_subscriptions" SET "new_id" = gen_random_uuid();
ALTER TABLE "user_subscriptions" DROP CONSTRAINT "user_subscriptions_pkey";
ALTER TABLE "user_subscriptions" DROP COLUMN "id";
ALTER TABLE "user_subscriptions" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "user_subscriptions" ADD PRIMARY KEY ("id");

-- ============================================================================
-- CONTENT SCHEMA CONVERSION
-- ============================================================================

-- Convert content_pillars table
ALTER TABLE "content_pillars" ADD COLUMN "new_id" uuid DEFAULT gen_random_uuid();
UPDATE "content_pillars" SET "new_id" = gen_random_uuid();

-- Update foreign key references in content_posts
ALTER TABLE "content_posts" ADD COLUMN "new_pillar_id" uuid;
UPDATE "content_posts" SET "new_pillar_id" = cp."new_id" 
FROM "content_pillars" cp WHERE "content_posts"."pillar_id" = cp."id";

-- Update foreign key references in content_templates  
ALTER TABLE "content_templates" ADD COLUMN "new_pillar_id" uuid;
UPDATE "content_templates" SET "new_pillar_id" = cp."new_id" 
FROM "content_pillars" cp WHERE "content_templates"."pillar_id" = cp."id";

ALTER TABLE "content_templates" ADD COLUMN "new_default_pillar_id" uuid;
UPDATE "content_templates" SET "new_default_pillar_id" = cp."new_id" 
FROM "content_pillars" cp WHERE "content_templates"."default_pillar_id" = cp."id";

-- Update foreign key references in content_calendar
ALTER TABLE "content_calendar" ADD COLUMN "new_pillar_id" uuid;
UPDATE "content_calendar" SET "new_pillar_id" = cp."new_id" 
FROM "content_pillars" cp WHERE "content_calendar"."pillar_id" = cp."id";

-- Update foreign key references in performance_snapshots
ALTER TABLE "performance_snapshots" ADD COLUMN "new_top_performing_pillar" uuid;
UPDATE "performance_snapshots" SET "new_top_performing_pillar" = cp."new_id" 
FROM "content_pillars" cp WHERE "performance_snapshots"."top_performing_pillar" = cp."id";

-- Update foreign key references in user_activity
ALTER TABLE "user_activity" ADD COLUMN "new_related_pillar_id" uuid;
UPDATE "user_activity" SET "new_related_pillar_id" = cp."new_id" 
FROM "content_pillars" cp WHERE "user_activity"."related_pillar_id" = cp."id";

-- Drop old constraints and update content_pillars
ALTER TABLE "content_pillars" DROP CONSTRAINT "content_pillars_pkey";
ALTER TABLE "content_pillars" DROP COLUMN "id";
ALTER TABLE "content_pillars" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "content_pillars" ADD PRIMARY KEY ("id");

-- Convert content_posts table
ALTER TABLE "content_posts" ADD COLUMN "new_id" uuid DEFAULT gen_random_uuid();
UPDATE "content_posts" SET "new_id" = gen_random_uuid();

-- Update foreign key references that point to content_posts
ALTER TABLE "post_analytics" ADD COLUMN "new_post_id" uuid;
UPDATE "post_analytics" SET "new_post_id" = cp."new_id" 
FROM "content_posts" cp WHERE "post_analytics"."post_id" = cp."id";

ALTER TABLE "engagement_metrics" ADD COLUMN "new_post_id" uuid;
UPDATE "engagement_metrics" SET "new_post_id" = cp."new_id" 
FROM "content_posts" cp WHERE "engagement_metrics"."post_id" = cp."id";

ALTER TABLE "performance_snapshots" ADD COLUMN "new_top_performing_post" uuid;
UPDATE "performance_snapshots" SET "new_top_performing_post" = cp."new_id" 
FROM "content_posts" cp WHERE "performance_snapshots"."top_performing_post" = cp."id";

ALTER TABLE "user_activity" ADD COLUMN "new_related_post_id" uuid;
UPDATE "user_activity" SET "new_related_post_id" = cp."new_id" 
FROM "content_posts" cp WHERE "user_activity"."related_post_id" = cp."id";

ALTER TABLE "content_calendar" ADD COLUMN "new_post_id" uuid;
UPDATE "content_calendar" SET "new_post_id" = cp."new_id" 
FROM "content_posts" cp WHERE "content_calendar"."post_id" = cp."id";

ALTER TABLE "events" ADD COLUMN "new_promotion_post_id" uuid;
UPDATE "events" SET "new_promotion_post_id" = cp."new_id" 
FROM "content_posts" cp WHERE "events"."promotion_post_id" = cp."id";

ALTER TABLE "leads" ADD COLUMN "new_source_post_id" uuid;
UPDATE "leads" SET "new_source_post_id" = cp."new_id" 
FROM "content_posts" cp WHERE "leads"."source_post_id" = cp."id";

-- Drop old constraints and update content_posts
ALTER TABLE "content_posts" DROP CONSTRAINT "content_posts_pkey";
ALTER TABLE "content_posts" DROP COLUMN "id";
ALTER TABLE "content_posts" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "content_posts" ADD PRIMARY KEY ("id");

-- Update content_posts foreign key references and drop old columns
ALTER TABLE "content_posts" DROP COLUMN "pillar_id";
ALTER TABLE "content_posts" RENAME COLUMN "new_pillar_id" TO "pillar_id";

-- Convert content_templates table
ALTER TABLE "content_templates" ADD COLUMN "new_id" uuid DEFAULT gen_random_uuid();
UPDATE "content_templates" SET "new_id" = gen_random_uuid();
ALTER TABLE "content_templates" DROP CONSTRAINT "content_templates_pkey";
ALTER TABLE "content_templates" DROP COLUMN "id";
ALTER TABLE "content_templates" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "content_templates" ADD PRIMARY KEY ("id");

-- Update content_templates foreign key references
ALTER TABLE "content_templates" DROP COLUMN "pillar_id";
ALTER TABLE "content_templates" RENAME COLUMN "new_pillar_id" TO "pillar_id";
ALTER TABLE "content_templates" DROP COLUMN "default_pillar_id";
ALTER TABLE "content_templates" RENAME COLUMN "new_default_pillar_id" TO "default_pillar_id";

-- Convert content_calendar table
ALTER TABLE "content_calendar" ADD COLUMN "new_id" uuid DEFAULT gen_random_uuid();
UPDATE "content_calendar" SET "new_id" = gen_random_uuid();
ALTER TABLE "content_calendar" DROP CONSTRAINT "content_calendar_pkey";
ALTER TABLE "content_calendar" DROP COLUMN "id";
ALTER TABLE "content_calendar" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "content_calendar" ADD PRIMARY KEY ("id");

-- Update content_calendar foreign key references
ALTER TABLE "content_calendar" DROP COLUMN "post_id";
ALTER TABLE "content_calendar" RENAME COLUMN "new_post_id" TO "post_id";
ALTER TABLE "content_calendar" DROP COLUMN "pillar_id";
ALTER TABLE "content_calendar" RENAME COLUMN "new_pillar_id" TO "pillar_id";

-- Convert content_drafts table
ALTER TABLE "content_drafts" ADD COLUMN "new_id" uuid DEFAULT gen_random_uuid();
UPDATE "content_drafts" SET "new_id" = gen_random_uuid();
ALTER TABLE "content_drafts" DROP CONSTRAINT "content_drafts_pkey";
ALTER TABLE "content_drafts" DROP COLUMN "id";
ALTER TABLE "content_drafts" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "content_drafts" ADD PRIMARY KEY ("id");

-- ============================================================================
-- ANALYTICS SCHEMA CONVERSION  
-- ============================================================================

-- Convert post_analytics table
ALTER TABLE "post_analytics" ADD COLUMN "new_id" uuid DEFAULT gen_random_uuid();
UPDATE "post_analytics" SET "new_id" = gen_random_uuid();
ALTER TABLE "post_analytics" DROP CONSTRAINT "post_analytics_pkey";
ALTER TABLE "post_analytics" DROP COLUMN "id";
ALTER TABLE "post_analytics" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "post_analytics" ADD PRIMARY KEY ("id");

-- Update post_analytics foreign key references
ALTER TABLE "post_analytics" DROP COLUMN "post_id";
ALTER TABLE "post_analytics" RENAME COLUMN "new_post_id" TO "post_id";

-- Convert engagement_metrics table
ALTER TABLE "engagement_metrics" ADD COLUMN "new_id" uuid DEFAULT gen_random_uuid();
UPDATE "engagement_metrics" SET "new_id" = gen_random_uuid();
ALTER TABLE "engagement_metrics" DROP CONSTRAINT "engagement_metrics_pkey";
ALTER TABLE "engagement_metrics" DROP COLUMN "id";
ALTER TABLE "engagement_metrics" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "engagement_metrics" ADD PRIMARY KEY ("id");

-- Update engagement_metrics foreign key references
ALTER TABLE "engagement_metrics" DROP COLUMN "post_id";
ALTER TABLE "engagement_metrics" RENAME COLUMN "new_post_id" TO "post_id";

-- Convert performance_snapshots table
ALTER TABLE "performance_snapshots" ADD COLUMN "new_id" uuid DEFAULT gen_random_uuid();
UPDATE "performance_snapshots" SET "new_id" = gen_random_uuid();
ALTER TABLE "performance_snapshots" DROP CONSTRAINT "performance_snapshots_pkey";
ALTER TABLE "performance_snapshots" DROP COLUMN "id";
ALTER TABLE "performance_snapshots" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "performance_snapshots" ADD PRIMARY KEY ("id");

-- Update performance_snapshots foreign key references
ALTER TABLE "performance_snapshots" DROP COLUMN "top_performing_post";
ALTER TABLE "performance_snapshots" RENAME COLUMN "new_top_performing_post" TO "top_performing_post";
ALTER TABLE "performance_snapshots" DROP COLUMN "top_performing_pillar";
ALTER TABLE "performance_snapshots" RENAME COLUMN "new_top_performing_pillar" TO "top_performing_pillar";

-- Convert user_activity table
ALTER TABLE "user_activity" ADD COLUMN "new_id" uuid DEFAULT gen_random_uuid();
UPDATE "user_activity" SET "new_id" = gen_random_uuid();
ALTER TABLE "user_activity" DROP CONSTRAINT "user_activity_pkey";
ALTER TABLE "user_activity" DROP COLUMN "id";
ALTER TABLE "user_activity" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "user_activity" ADD PRIMARY KEY ("id");

-- Update user_activity foreign key references
ALTER TABLE "user_activity" DROP COLUMN "related_post_id";
ALTER TABLE "user_activity" RENAME COLUMN "new_related_post_id" TO "related_post_id";
ALTER TABLE "user_activity" DROP COLUMN "related_pillar_id";
ALTER TABLE "user_activity" RENAME COLUMN "new_related_pillar_id" TO "related_pillar_id";

-- Convert analytics_goals table
ALTER TABLE "analytics_goals" ADD COLUMN "new_id" uuid DEFAULT gen_random_uuid();
UPDATE "analytics_goals" SET "new_id" = gen_random_uuid();
ALTER TABLE "analytics_goals" DROP CONSTRAINT "analytics_goals_pkey";
ALTER TABLE "analytics_goals" DROP COLUMN "id";
ALTER TABLE "analytics_goals" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "analytics_goals" ADD PRIMARY KEY ("id");

-- Convert content_insights table
ALTER TABLE "content_insights" ADD COLUMN "new_id" uuid DEFAULT gen_random_uuid();
UPDATE "content_insights" SET "new_id" = gen_random_uuid();
ALTER TABLE "content_insights" DROP CONSTRAINT "content_insights_pkey";
ALTER TABLE "content_insights" DROP COLUMN "id";
ALTER TABLE "content_insights" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "content_insights" ADD PRIMARY KEY ("id");

-- ============================================================================
-- BUSINESS SCHEMA CONVERSION
-- ============================================================================

-- Convert events table
ALTER TABLE "events" ADD COLUMN "new_id" uuid DEFAULT gen_random_uuid();
UPDATE "events" SET "new_id" = gen_random_uuid();

-- Update foreign key references to events
ALTER TABLE "event_attendees" ADD COLUMN "new_event_id" uuid;
UPDATE "event_attendees" SET "new_event_id" = e."new_id" 
FROM "events" e WHERE "event_attendees"."event_id" = e."id";

ALTER TABLE "leads" ADD COLUMN "new_source_event_id" uuid;
UPDATE "leads" SET "new_source_event_id" = e."new_id" 
FROM "events" e WHERE "leads"."source_event_id" = e."id";

-- Drop old constraints and update events
ALTER TABLE "events" DROP CONSTRAINT "events_pkey";
ALTER TABLE "events" DROP COLUMN "id";
ALTER TABLE "events" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "events" ADD PRIMARY KEY ("id");

-- Update events foreign key references
ALTER TABLE "events" DROP COLUMN "promotion_post_id";
ALTER TABLE "events" RENAME COLUMN "new_promotion_post_id" TO "promotion_post_id";

-- Convert event_attendees table  
ALTER TABLE "event_attendees" ADD COLUMN "new_id" uuid DEFAULT gen_random_uuid();
UPDATE "event_attendees" SET "new_id" = gen_random_uuid();
ALTER TABLE "event_attendees" DROP CONSTRAINT "event_attendees_pkey";
ALTER TABLE "event_attendees" DROP COLUMN "id";
ALTER TABLE "event_attendees" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "event_attendees" ADD PRIMARY KEY ("id");

-- Update event_attendees foreign key references
ALTER TABLE "event_attendees" DROP COLUMN "event_id";
ALTER TABLE "event_attendees" RENAME COLUMN "new_event_id" TO "event_id";

-- Convert leads table
ALTER TABLE "leads" ADD COLUMN "new_id" uuid DEFAULT gen_random_uuid();
UPDATE "leads" SET "new_id" = gen_random_uuid();

-- Update foreign key references to leads
ALTER TABLE "lead_interactions" ADD COLUMN "new_lead_id" uuid;
UPDATE "lead_interactions" SET "new_lead_id" = l."new_id" 
FROM "leads" l WHERE "lead_interactions"."lead_id" = l."id";

-- Drop old constraints and update leads
ALTER TABLE "leads" DROP CONSTRAINT "leads_pkey";
ALTER TABLE "leads" DROP COLUMN "id";
ALTER TABLE "leads" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "leads" ADD PRIMARY KEY ("id");

-- Update leads foreign key references
ALTER TABLE "leads" DROP COLUMN "source_post_id";
ALTER TABLE "leads" RENAME COLUMN "new_source_post_id" TO "source_post_id";
ALTER TABLE "leads" DROP COLUMN "source_event_id";
ALTER TABLE "leads" RENAME COLUMN "new_source_event_id" TO "source_event_id";

-- Convert lead_interactions table
ALTER TABLE "lead_interactions" ADD COLUMN "new_id" uuid DEFAULT gen_random_uuid();
UPDATE "lead_interactions" SET "new_id" = gen_random_uuid();
ALTER TABLE "lead_interactions" DROP CONSTRAINT "lead_interactions_pkey";
ALTER TABLE "lead_interactions" DROP COLUMN "id";
ALTER TABLE "lead_interactions" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "lead_interactions" ADD PRIMARY KEY ("id");

-- Update lead_interactions foreign key references
ALTER TABLE "lead_interactions" DROP COLUMN "lead_id";
ALTER TABLE "lead_interactions" RENAME COLUMN "new_lead_id" TO "lead_id";

-- Convert campaigns table
ALTER TABLE "campaigns" ADD COLUMN "new_id" uuid DEFAULT gen_random_uuid();
UPDATE "campaigns" SET "new_id" = gen_random_uuid();
ALTER TABLE "campaigns" DROP CONSTRAINT "campaigns_pkey";
ALTER TABLE "campaigns" DROP COLUMN "id";
ALTER TABLE "campaigns" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "campaigns" ADD PRIMARY KEY ("id");

-- Convert services table
ALTER TABLE "services" ADD COLUMN "new_id" uuid DEFAULT gen_random_uuid();
UPDATE "services" SET "new_id" = gen_random_uuid();
ALTER TABLE "services" DROP CONSTRAINT "services_pkey";
ALTER TABLE "services" DROP COLUMN "id";
ALTER TABLE "services" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "services" ADD PRIMARY KEY ("id");

-- ============================================================================
-- ADD FOREIGN KEY CONSTRAINTS BACK
-- ============================================================================

-- Content schema constraints
ALTER TABLE "content_posts" ADD CONSTRAINT "content_posts_pillar_id_fkey" 
  FOREIGN KEY ("pillar_id") REFERENCES "content_pillars"("id") ON DELETE SET NULL;

ALTER TABLE "content_templates" ADD CONSTRAINT "content_templates_pillar_id_fkey" 
  FOREIGN KEY ("pillar_id") REFERENCES "content_pillars"("id") ON DELETE SET NULL;

ALTER TABLE "content_templates" ADD CONSTRAINT "content_templates_default_pillar_id_fkey" 
  FOREIGN KEY ("default_pillar_id") REFERENCES "content_pillars"("id");

ALTER TABLE "content_calendar" ADD CONSTRAINT "content_calendar_post_id_fkey" 
  FOREIGN KEY ("post_id") REFERENCES "content_posts"("id") ON DELETE CASCADE;

ALTER TABLE "content_calendar" ADD CONSTRAINT "content_calendar_pillar_id_fkey" 
  FOREIGN KEY ("pillar_id") REFERENCES "content_pillars"("id");

-- Analytics schema constraints
ALTER TABLE "post_analytics" ADD CONSTRAINT "post_analytics_post_id_fkey" 
  FOREIGN KEY ("post_id") REFERENCES "content_posts"("id") ON DELETE CASCADE;

ALTER TABLE "engagement_metrics" ADD CONSTRAINT "engagement_metrics_post_id_fkey" 
  FOREIGN KEY ("post_id") REFERENCES "content_posts"("id") ON DELETE CASCADE;

ALTER TABLE "performance_snapshots" ADD CONSTRAINT "performance_snapshots_top_performing_post_fkey" 
  FOREIGN KEY ("top_performing_post") REFERENCES "content_posts"("id");

ALTER TABLE "performance_snapshots" ADD CONSTRAINT "performance_snapshots_top_performing_pillar_fkey" 
  FOREIGN KEY ("top_performing_pillar") REFERENCES "content_pillars"("id");

ALTER TABLE "user_activity" ADD CONSTRAINT "user_activity_related_post_id_fkey" 
  FOREIGN KEY ("related_post_id") REFERENCES "content_posts"("id");

ALTER TABLE "user_activity" ADD CONSTRAINT "user_activity_related_pillar_id_fkey" 
  FOREIGN KEY ("related_pillar_id") REFERENCES "content_pillars"("id");

-- Business schema constraints  
ALTER TABLE "events" ADD CONSTRAINT "events_promotion_post_id_fkey" 
  FOREIGN KEY ("promotion_post_id") REFERENCES "content_posts"("id");

ALTER TABLE "event_attendees" ADD CONSTRAINT "event_attendees_event_id_fkey" 
  FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE;

ALTER TABLE "leads" ADD CONSTRAINT "leads_source_post_id_fkey" 
  FOREIGN KEY ("source_post_id") REFERENCES "content_posts"("id");

ALTER TABLE "leads" ADD CONSTRAINT "leads_source_event_id_fkey" 
  FOREIGN KEY ("source_event_id") REFERENCES "events"("id");

ALTER TABLE "lead_interactions" ADD CONSTRAINT "lead_interactions_lead_id_fkey" 
  FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE; 