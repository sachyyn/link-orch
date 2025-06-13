CREATE TYPE "public"."ai_action_type" AS ENUM('content_generation', 'content_regeneration', 'image_generation', 'content_refinement', 'asset_creation');--> statement-breakpoint
CREATE TYPE "public"."asset_type" AS ENUM('image', 'carousel', 'infographic', 'banner', 'thumbnail', 'logo', 'chart');--> statement-breakpoint
CREATE TYPE "public"."content_tone" AS ENUM('professional', 'casual', 'thought-leader', 'provocative', 'educational', 'inspirational', 'conversational', 'custom');--> statement-breakpoint
CREATE TYPE "public"."content_type" AS ENUM('text-post', 'carousel', 'video-script', 'poll', 'article', 'story', 'announcement');--> statement-breakpoint
CREATE TYPE "public"."session_status" AS ENUM('ideation', 'generating', 'asset-creation', 'ready', 'completed', 'archived');--> statement-breakpoint
CREATE TABLE "ai_content_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
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
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
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
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"post_idea" text NOT NULL,
	"additional_context" text,
	"target_content_type" "content_type" DEFAULT 'text-post' NOT NULL,
	"selected_model" varchar(100) NOT NULL,
	"custom_prompt" text,
	"status" "session_status" DEFAULT 'ideation' NOT NULL,
	"current_step" varchar(50) DEFAULT 'ideation',
	"total_versions" integer DEFAULT 0 NOT NULL,
	"selected_version_id" integer,
	"needs_asset" boolean DEFAULT false,
	"asset_generated" boolean DEFAULT false,
	"final_content" text,
	"is_completed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_projects" (
	"id" serial PRIMARY KEY NOT NULL,
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
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"project_id" integer,
	"session_id" integer,
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
ALTER TABLE "ai_content_versions" ADD CONSTRAINT "ai_content_versions_session_id_ai_post_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."ai_post_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_generated_assets" ADD CONSTRAINT "ai_generated_assets_session_id_ai_post_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."ai_post_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_post_sessions" ADD CONSTRAINT "ai_post_sessions_project_id_ai_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."ai_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_projects" ADD CONSTRAINT "ai_projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_usage_logs" ADD CONSTRAINT "ai_usage_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_usage_logs" ADD CONSTRAINT "ai_usage_logs_project_id_ai_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."ai_projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_usage_logs" ADD CONSTRAINT "ai_usage_logs_session_id_ai_post_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."ai_post_sessions"("id") ON DELETE set null ON UPDATE no action;