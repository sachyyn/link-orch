CREATE TYPE "public"."ai_action_type" AS ENUM('content_generation', 'content_regeneration', 'image_generation', 'content_refinement', 'asset_creation');--> statement-breakpoint
CREATE TYPE "public"."asset_type" AS ENUM('image', 'carousel', 'infographic', 'banner', 'thumbnail', 'logo', 'chart');--> statement-breakpoint
CREATE TYPE "public"."content_tone" AS ENUM('professional', 'casual', 'thought-leader', 'provocative', 'educational', 'inspirational', 'conversational', 'custom');--> statement-breakpoint
CREATE TYPE "public"."content_type" AS ENUM('text-post', 'carousel', 'video-script', 'poll', 'article', 'story', 'announcement');--> statement-breakpoint
CREATE TYPE "public"."session_status" AS ENUM('ideation', 'generating', 'asset-creation', 'ready', 'completed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('draft', 'published', 'ongoing', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('webinar', 'workshop', 'conference', 'networking', 'interview', 'meeting');--> statement-breakpoint
CREATE TYPE "public"."lead_source" AS ENUM('linkedin_post', 'linkedin_message', 'event', 'referral', 'website', 'other');--> statement-breakpoint
CREATE TYPE "public"."lead_status" AS ENUM('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost');--> statement-breakpoint
CREATE TYPE "public"."post_status" AS ENUM('draft', 'scheduled', 'published', 'failed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."post_type" AS ENUM('text', 'image', 'video', 'document', 'poll', 'article');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'cancelled', 'expired', 'trial');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('free', 'pro', 'enterprise', 'admin');--> statement-breakpoint
CREATE TABLE "ai_content_versions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"session_id" uuid NOT NULL,
	"version_number" integer NOT NULL,
	"generation_batch" integer DEFAULT 1,
	"content" text NOT NULL,
	"content_length" integer,
	"estimated_read_time" integer,
	"hashtags" varchar(500),
	"mentions" varchar(500),
	"call_to_action" text,
	"model_used" varchar(100) NOT NULL,
	"tokens_used" integer,
	"generation_time" integer,
	"prompt" text,
	"is_selected" boolean DEFAULT false,
	"user_rating" integer,
	"user_feedback" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_generated_assets" (
	"id" uuid PRIMARY KEY NOT NULL,
	"session_id" uuid NOT NULL,
	"asset_type" "asset_type" NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_url" varchar(500) NOT NULL,
	"file_size" integer,
	"prompt" text NOT NULL,
	"model" varchar(100),
	"style" varchar(100),
	"dimensions" varchar(50),
	"generation_time" integer,
	"generation_cost" varchar(20),
	"is_selected" boolean DEFAULT false,
	"is_downloaded" boolean DEFAULT false,
	"download_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_post_sessions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"post_idea" text NOT NULL,
	"additional_context" text,
	"target_content_type" "content_type" DEFAULT 'text-post' NOT NULL,
	"selected_model" varchar(100) NOT NULL,
	"custom_prompt" text,
	"status" "session_status" DEFAULT 'ideation' NOT NULL,
	"current_step" varchar(50) DEFAULT 'ideation',
	"total_versions" integer DEFAULT 0 NOT NULL,
	"selected_version_id" uuid,
	"needs_asset" boolean DEFAULT false,
	"asset_generated" boolean DEFAULT false,
	"final_content" text,
	"is_completed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_projects" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"tone" "content_tone" DEFAULT 'professional' NOT NULL,
	"content_types" varchar(500) NOT NULL,
	"guidelines" text NOT NULL,
	"target_audience" text,
	"key_topics" text,
	"brand_voice" text,
	"content_pillars" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"default_model" varchar(100) DEFAULT 'gemini-2.0-flash-exp',
	"total_sessions" integer DEFAULT 0 NOT NULL,
	"total_posts" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_usage_logs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"project_id" uuid,
	"session_id" uuid,
	"action_type" "ai_action_type" NOT NULL,
	"model_used" varchar(100) NOT NULL,
	"tokens_used" integer,
	"processing_time" integer,
	"api_cost" varchar(20),
	"request_payload" text,
	"response_size" integer,
	"is_successful" boolean DEFAULT true,
	"error_message" text,
	"retry_count" integer DEFAULT 0,
	"user_agent" varchar(500),
	"ip_address" varchar(45),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics_goals" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"goal_type" varchar(50) NOT NULL,
	"target_value" integer NOT NULL,
	"current_value" integer DEFAULT 0,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"is_active" varchar(20) DEFAULT 'active',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_insights" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"insight_type" varchar(50) NOT NULL,
	"title" varchar(300) NOT NULL,
	"description" text NOT NULL,
	"data_points" jsonb,
	"confidence_score" numeric(3, 2) DEFAULT '0.00',
	"suggested_actions" jsonb,
	"is_actionable" varchar(20) DEFAULT 'true',
	"status" varchar(20) DEFAULT 'new',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "engagement_metrics" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"post_id" uuid,
	"interaction_type" varchar(50) NOT NULL,
	"interaction_value" text,
	"interactor_linkedin_id" varchar(100),
	"interactor_name" varchar(200),
	"interactor_title" varchar(200),
	"interactor_company" varchar(200),
	"interaction_time" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "performance_snapshots" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"snapshot_type" varchar(20) NOT NULL,
	"snapshot_date" date NOT NULL,
	"total_posts" integer DEFAULT 0,
	"total_impressions" integer DEFAULT 0,
	"total_engagement" integer DEFAULT 0,
	"avg_engagement_rate" numeric(5, 2) DEFAULT '0.00',
	"follower_growth" integer DEFAULT 0,
	"connection_growth" integer DEFAULT 0,
	"profile_views" integer DEFAULT 0,
	"top_performing_post" uuid,
	"top_performing_pillar" uuid,
	"pillar_metrics" jsonb,
	"likes_breakdown" integer DEFAULT 0,
	"comments_breakdown" integer DEFAULT 0,
	"shares_breakdown" integer DEFAULT 0,
	"clicks_breakdown" integer DEFAULT 0,
	"best_posting_times" jsonb,
	"engagement_by_day_of_week" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_analytics" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"post_id" uuid NOT NULL,
	"linkedin_post_id" varchar(100),
	"impressions" integer DEFAULT 0,
	"likes" integer DEFAULT 0,
	"comments" integer DEFAULT 0,
	"shares" integer DEFAULT 0,
	"clicks" integer DEFAULT 0,
	"engagement_rate" numeric(5, 2) DEFAULT '0.00',
	"click_through_rate" numeric(5, 2) DEFAULT '0.00',
	"profile_views" integer DEFAULT 0,
	"new_followers" integer DEFAULT 0,
	"new_connections" integer DEFAULT 0,
	"first_hour_engagement" integer DEFAULT 0,
	"first_day_engagement" integer DEFAULT 0,
	"peak_engagement_time" timestamp,
	"top_countries" jsonb,
	"top_industries" jsonb,
	"audience_growth" integer DEFAULT 0,
	"snapshot_date" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_activity" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"activity_type" varchar(50) NOT NULL,
	"description" text,
	"metadata" jsonb,
	"ip_address" varchar(45),
	"user_agent" text,
	"referrer" varchar(500),
	"related_post_id" uuid,
	"related_pillar_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"campaign_type" varchar(50) NOT NULL,
	"status" varchar(50) DEFAULT 'draft',
	"start_date" date,
	"end_date" date,
	"primary_goal" varchar(100),
	"target_audience" text,
	"success_metrics" jsonb,
	"budget" numeric(10, 2),
	"currency" varchar(3) DEFAULT 'USD',
	"total_reach" integer DEFAULT 0,
	"total_engagement" integer DEFAULT 0,
	"total_leads" integer DEFAULT 0,
	"total_conversions" integer DEFAULT 0,
	"content_pieces" jsonb,
	"landing_pages" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_attendees" (
	"id" uuid PRIMARY KEY NOT NULL,
	"event_id" uuid NOT NULL,
	"user_id" varchar(255),
	"name" varchar(200) NOT NULL,
	"email" varchar(255) NOT NULL,
	"company" varchar(200),
	"job_title" varchar(200),
	"linkedin_profile" varchar(500),
	"registration_status" varchar(50) DEFAULT 'registered',
	"attendance_status" varchar(50) DEFAULT 'pending',
	"questions_asked" integer DEFAULT 0,
	"engagement_score" numeric(5, 2) DEFAULT '0.00',
	"feedback" text,
	"rating" integer,
	"registration_source" varchar(100),
	"special_requests" text,
	"registered_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"title" varchar(300) NOT NULL,
	"description" text,
	"event_type" "event_type" NOT NULL,
	"status" "event_status" DEFAULT 'draft' NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"timezone" varchar(100) DEFAULT 'UTC',
	"is_virtual" boolean DEFAULT true NOT NULL,
	"location" varchar(500),
	"meeting_url" varchar(500),
	"access_code" varchar(50),
	"max_attendees" integer,
	"current_attendees" integer DEFAULT 0,
	"is_free" boolean DEFAULT true NOT NULL,
	"price" numeric(10, 2) DEFAULT '0.00',
	"currency" varchar(3) DEFAULT 'USD',
	"linkedin_event_id" varchar(100),
	"linkedin_event_url" varchar(500),
	"promotion_post_id" uuid,
	"agenda" jsonb,
	"speakers" jsonb,
	"materials" jsonb,
	"requires_approval" boolean DEFAULT false,
	"allow_waitlist" boolean DEFAULT true,
	"send_reminders" boolean DEFAULT true,
	"total_views" integer DEFAULT 0,
	"total_registrations" integer DEFAULT 0,
	"total_attendance" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lead_interactions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"lead_id" uuid NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"interaction_type" varchar(50) NOT NULL,
	"direction" varchar(20) NOT NULL,
	"subject" varchar(300),
	"content" text,
	"outcome" varchar(100),
	"next_action" text,
	"duration" integer,
	"attachments" jsonb,
	"interaction_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"name" varchar(200) NOT NULL,
	"email" varchar(255),
	"phone" varchar(50),
	"company" varchar(200),
	"job_title" varchar(200),
	"linkedin_profile" varchar(500),
	"status" "lead_status" DEFAULT 'new' NOT NULL,
	"source" "lead_source" NOT NULL,
	"priority" varchar(20) DEFAULT 'medium',
	"estimated_value" numeric(12, 2),
	"currency" varchar(3) DEFAULT 'USD',
	"project_description" text,
	"budget" varchar(100),
	"timeline" varchar(100),
	"first_contact_date" date,
	"last_contact_date" date,
	"next_follow_up_date" date,
	"total_interactions" integer DEFAULT 0,
	"source_post_id" uuid,
	"source_event_id" uuid,
	"referrer_name" varchar(200),
	"lead_score" integer DEFAULT 0,
	"qualification_notes" text,
	"tags" jsonb,
	"industry" varchar(100),
	"company_size" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"category" varchar(100),
	"price_type" varchar(50),
	"base_price" numeric(10, 2),
	"currency" varchar(3) DEFAULT 'USD',
	"delivery_method" varchar(50),
	"duration" varchar(100),
	"is_active" boolean DEFAULT true,
	"requires_consultation" boolean DEFAULT true,
	"max_clients_per_month" integer,
	"package_includes" jsonb,
	"prerequisites" text,
	"target_audience" text,
	"total_inquiries" integer DEFAULT 0,
	"total_bookings" integer DEFAULT 0,
	"avg_rating" numeric(3, 2) DEFAULT '0.00',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_calendar" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"post_id" uuid,
	"title" varchar(300) NOT NULL,
	"date" timestamp NOT NULL,
	"time_slot" varchar(20),
	"status" varchar(50) DEFAULT 'planned',
	"priority" varchar(20) DEFAULT 'medium',
	"pillar_id" uuid,
	"content_ideas" jsonb,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_drafts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"title" varchar(500),
	"content" text,
	"post_type" "post_type" DEFAULT 'text',
	"auto_save_data" jsonb,
	"last_edited_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_pillars" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"color" varchar(7) DEFAULT '#000000',
	"icon" varchar(50),
	"post_count" integer DEFAULT 0,
	"total_engagement" integer DEFAULT 0,
	"avg_engagement" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_posts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"pillar_id" uuid,
	"title" varchar(500),
	"content" text NOT NULL,
	"post_type" "post_type" DEFAULT 'text' NOT NULL,
	"media_urls" jsonb,
	"document_urls" jsonb,
	"hashtags" jsonb,
	"mentions" jsonb,
	"status" "post_status" DEFAULT 'draft' NOT NULL,
	"scheduled_at" timestamp,
	"published_at" timestamp,
	"linkedin_post_id" varchar(100),
	"linkedin_post_url" varchar(500),
	"like_count" integer DEFAULT 0,
	"comment_count" integer DEFAULT 0,
	"share_count" integer DEFAULT 0,
	"impression_count" integer DEFAULT 0,
	"source_template" varchar(100),
	"ai_generated" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_templates" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"pillar_id" uuid,
	"name" varchar(200) NOT NULL,
	"description" text,
	"template" text NOT NULL,
	"post_type" "post_type" DEFAULT 'text' NOT NULL,
	"is_public" boolean DEFAULT false,
	"usage_count" integer DEFAULT 0,
	"tags" jsonb,
	"default_hashtags" jsonb,
	"default_pillar_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"job_title" varchar(200),
	"company" varchar(200),
	"linkedin_url" varchar(500),
	"primary_goal" varchar(100),
	"linkedin_username" varchar(100),
	"follower_count" varchar(50),
	"connection_count" varchar(50),
	"bio" text,
	"expertise" jsonb,
	"interests" jsonb,
	"onboarding_completed" boolean DEFAULT false NOT NULL,
	"onboarding_completed_at" timestamp,
	"timezone" varchar(100) DEFAULT 'UTC',
	"language" varchar(10) DEFAULT 'en',
	"email_notifications" boolean DEFAULT true,
	"push_notifications" boolean DEFAULT true,
	"weekly_digest" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_subscriptions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"status" "subscription_status" DEFAULT 'trial' NOT NULL,
	"plan_type" varchar(50) NOT NULL,
	"billing_period" varchar(20),
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"trial_end_date" timestamp,
	"stripe_customer_id" varchar(100),
	"stripe_subscription_id" varchar(100),
	"monthly_post_limit" varchar(10) DEFAULT '10',
	"monthly_posts_used" varchar(10) DEFAULT '0',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"first_name" varchar(100),
	"last_name" varchar(100),
	"image_url" varchar(500),
	"role" "user_role" DEFAULT 'free' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "ai_content_versions" ADD CONSTRAINT "ai_content_versions_session_id_ai_post_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."ai_post_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_generated_assets" ADD CONSTRAINT "ai_generated_assets_session_id_ai_post_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."ai_post_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_post_sessions" ADD CONSTRAINT "ai_post_sessions_project_id_ai_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."ai_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_projects" ADD CONSTRAINT "ai_projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_usage_logs" ADD CONSTRAINT "ai_usage_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_usage_logs" ADD CONSTRAINT "ai_usage_logs_project_id_ai_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."ai_projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_usage_logs" ADD CONSTRAINT "ai_usage_logs_session_id_ai_post_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."ai_post_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_goals" ADD CONSTRAINT "analytics_goals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_insights" ADD CONSTRAINT "content_insights_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "engagement_metrics" ADD CONSTRAINT "engagement_metrics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "engagement_metrics" ADD CONSTRAINT "engagement_metrics_post_id_content_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."content_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performance_snapshots" ADD CONSTRAINT "performance_snapshots_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performance_snapshots" ADD CONSTRAINT "performance_snapshots_top_performing_post_content_posts_id_fk" FOREIGN KEY ("top_performing_post") REFERENCES "public"."content_posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performance_snapshots" ADD CONSTRAINT "performance_snapshots_top_performing_pillar_content_pillars_id_fk" FOREIGN KEY ("top_performing_pillar") REFERENCES "public"."content_pillars"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_analytics" ADD CONSTRAINT "post_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_analytics" ADD CONSTRAINT "post_analytics_post_id_content_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."content_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_activity" ADD CONSTRAINT "user_activity_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_activity" ADD CONSTRAINT "user_activity_related_post_id_content_posts_id_fk" FOREIGN KEY ("related_post_id") REFERENCES "public"."content_posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_activity" ADD CONSTRAINT "user_activity_related_pillar_id_content_pillars_id_fk" FOREIGN KEY ("related_pillar_id") REFERENCES "public"."content_pillars"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_attendees" ADD CONSTRAINT "event_attendees_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_attendees" ADD CONSTRAINT "event_attendees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_promotion_post_id_content_posts_id_fk" FOREIGN KEY ("promotion_post_id") REFERENCES "public"."content_posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_interactions" ADD CONSTRAINT "lead_interactions_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_interactions" ADD CONSTRAINT "lead_interactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_source_post_id_content_posts_id_fk" FOREIGN KEY ("source_post_id") REFERENCES "public"."content_posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_source_event_id_events_id_fk" FOREIGN KEY ("source_event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_calendar" ADD CONSTRAINT "content_calendar_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_calendar" ADD CONSTRAINT "content_calendar_post_id_content_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."content_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_calendar" ADD CONSTRAINT "content_calendar_pillar_id_content_pillars_id_fk" FOREIGN KEY ("pillar_id") REFERENCES "public"."content_pillars"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_drafts" ADD CONSTRAINT "content_drafts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_pillars" ADD CONSTRAINT "content_pillars_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_posts" ADD CONSTRAINT "content_posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_posts" ADD CONSTRAINT "content_posts_pillar_id_content_pillars_id_fk" FOREIGN KEY ("pillar_id") REFERENCES "public"."content_pillars"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_templates" ADD CONSTRAINT "content_templates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_templates" ADD CONSTRAINT "content_templates_pillar_id_content_pillars_id_fk" FOREIGN KEY ("pillar_id") REFERENCES "public"."content_pillars"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_templates" ADD CONSTRAINT "content_templates_default_pillar_id_content_pillars_id_fk" FOREIGN KEY ("default_pillar_id") REFERENCES "public"."content_pillars"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;