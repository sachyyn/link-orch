-- Enable UUID extension for native UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Step 1: Add temporary UUID columns to store new UUIDs
ALTER TABLE "ai_projects" ADD COLUMN "id_new" uuid DEFAULT gen_random_uuid();
ALTER TABLE "ai_post_sessions" ADD COLUMN "id_new" uuid DEFAULT gen_random_uuid();
ALTER TABLE "ai_post_sessions" ADD COLUMN "project_id_new" uuid;
ALTER TABLE "ai_content_versions" ADD COLUMN "id_new" uuid DEFAULT gen_random_uuid();
ALTER TABLE "ai_content_versions" ADD COLUMN "session_id_new" uuid;
ALTER TABLE "ai_generated_assets" ADD COLUMN "id_new" uuid DEFAULT gen_random_uuid();
ALTER TABLE "ai_generated_assets" ADD COLUMN "session_id_new" uuid;
ALTER TABLE "ai_usage_logs" ADD COLUMN "id_new" uuid DEFAULT gen_random_uuid();
ALTER TABLE "ai_usage_logs" ADD COLUMN "project_id_new" uuid;
ALTER TABLE "ai_usage_logs" ADD COLUMN "session_id_new" uuid;
ALTER TABLE "ai_post_sessions" ADD COLUMN "selected_version_id_new" uuid;

-- Step 2: Populate new UUID columns with generated values
UPDATE "ai_projects" SET "id_new" = gen_random_uuid();
UPDATE "ai_post_sessions" SET "id_new" = gen_random_uuid();
UPDATE "ai_content_versions" SET "id_new" = gen_random_uuid();
UPDATE "ai_generated_assets" SET "id_new" = gen_random_uuid();
UPDATE "ai_usage_logs" SET "id_new" = gen_random_uuid();

-- Step 3: Update foreign key relationships using a mapping approach
-- Update project_id_new in ai_post_sessions
UPDATE "ai_post_sessions" 
SET "project_id_new" = p."id_new" 
FROM "ai_projects" p 
WHERE "ai_post_sessions"."project_id" = p."id";

-- Update session_id_new in ai_content_versions
UPDATE "ai_content_versions" 
SET "session_id_new" = s."id_new" 
FROM "ai_post_sessions" s 
WHERE "ai_content_versions"."session_id" = s."id";

-- Update session_id_new in ai_generated_assets
UPDATE "ai_generated_assets" 
SET "session_id_new" = s."id_new" 
FROM "ai_post_sessions" s 
WHERE "ai_generated_assets"."session_id" = s."id";

-- Update project_id_new in ai_usage_logs
UPDATE "ai_usage_logs" 
SET "project_id_new" = p."id_new" 
FROM "ai_projects" p 
WHERE "ai_usage_logs"."project_id" = p."id";

-- Update session_id_new in ai_usage_logs
UPDATE "ai_usage_logs" 
SET "session_id_new" = s."id_new" 
FROM "ai_post_sessions" s 
WHERE "ai_usage_logs"."session_id" = s."id";

-- Update selected_version_id_new in ai_post_sessions
UPDATE "ai_post_sessions" 
SET "selected_version_id_new" = v."id_new" 
FROM "ai_content_versions" v 
WHERE "ai_post_sessions"."selected_version_id" = v."id";

-- Step 4: Drop foreign key constraints
ALTER TABLE "ai_content_versions" DROP CONSTRAINT "ai_content_versions_session_id_ai_post_sessions_id_fk";
ALTER TABLE "ai_generated_assets" DROP CONSTRAINT "ai_generated_assets_session_id_ai_post_sessions_id_fk";
ALTER TABLE "ai_post_sessions" DROP CONSTRAINT "ai_post_sessions_project_id_ai_projects_id_fk";
ALTER TABLE "ai_usage_logs" DROP CONSTRAINT "ai_usage_logs_project_id_ai_projects_id_fk";
ALTER TABLE "ai_usage_logs" DROP CONSTRAINT "ai_usage_logs_session_id_ai_post_sessions_id_fk";

-- Step 5: Drop old columns and rename new ones
-- ai_projects
ALTER TABLE "ai_projects" DROP COLUMN "id";
ALTER TABLE "ai_projects" RENAME COLUMN "id_new" TO "id";
ALTER TABLE "ai_projects" ADD PRIMARY KEY ("id");

-- ai_post_sessions
ALTER TABLE "ai_post_sessions" DROP COLUMN "id";
ALTER TABLE "ai_post_sessions" DROP COLUMN "project_id";
ALTER TABLE "ai_post_sessions" DROP COLUMN "selected_version_id";
ALTER TABLE "ai_post_sessions" RENAME COLUMN "id_new" TO "id";
ALTER TABLE "ai_post_sessions" RENAME COLUMN "project_id_new" TO "project_id";
ALTER TABLE "ai_post_sessions" RENAME COLUMN "selected_version_id_new" TO "selected_version_id";
ALTER TABLE "ai_post_sessions" ADD PRIMARY KEY ("id");

-- ai_content_versions
ALTER TABLE "ai_content_versions" DROP COLUMN "id";
ALTER TABLE "ai_content_versions" DROP COLUMN "session_id";
ALTER TABLE "ai_content_versions" RENAME COLUMN "id_new" TO "id";
ALTER TABLE "ai_content_versions" RENAME COLUMN "session_id_new" TO "session_id";
ALTER TABLE "ai_content_versions" ADD PRIMARY KEY ("id");

-- ai_generated_assets
ALTER TABLE "ai_generated_assets" DROP COLUMN "id";
ALTER TABLE "ai_generated_assets" DROP COLUMN "session_id";
ALTER TABLE "ai_generated_assets" RENAME COLUMN "id_new" TO "id";
ALTER TABLE "ai_generated_assets" RENAME COLUMN "session_id_new" TO "session_id";
ALTER TABLE "ai_generated_assets" ADD PRIMARY KEY ("id");

-- ai_usage_logs
ALTER TABLE "ai_usage_logs" DROP COLUMN "id";
ALTER TABLE "ai_usage_logs" DROP COLUMN "project_id";
ALTER TABLE "ai_usage_logs" DROP COLUMN "session_id";
ALTER TABLE "ai_usage_logs" RENAME COLUMN "id_new" TO "id";
ALTER TABLE "ai_usage_logs" RENAME COLUMN "project_id_new" TO "project_id";
ALTER TABLE "ai_usage_logs" RENAME COLUMN "session_id_new" TO "session_id";
ALTER TABLE "ai_usage_logs" ADD PRIMARY KEY ("id");

-- Step 6: Set NOT NULL constraints where needed
ALTER TABLE "ai_post_sessions" ALTER COLUMN "project_id" SET NOT NULL;
ALTER TABLE "ai_content_versions" ALTER COLUMN "session_id" SET NOT NULL;
ALTER TABLE "ai_generated_assets" ALTER COLUMN "session_id" SET NOT NULL;

-- Step 7: Set default UUID generation for new records
ALTER TABLE "ai_projects" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "ai_post_sessions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "ai_content_versions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "ai_generated_assets" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "ai_usage_logs" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- Step 8: Recreate foreign key constraints
ALTER TABLE "ai_content_versions" ADD CONSTRAINT "ai_content_versions_session_id_ai_post_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "ai_post_sessions"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "ai_generated_assets" ADD CONSTRAINT "ai_generated_assets_session_id_ai_post_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "ai_post_sessions"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "ai_post_sessions" ADD CONSTRAINT "ai_post_sessions_project_id_ai_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "ai_projects"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "ai_usage_logs" ADD CONSTRAINT "ai_usage_logs_project_id_ai_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "ai_projects"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "ai_usage_logs" ADD CONSTRAINT "ai_usage_logs_session_id_ai_post_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "ai_post_sessions"("id") ON DELETE set null ON UPDATE no action;