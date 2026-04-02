ALTER TABLE "dot-storage"."file" ADD COLUMN IF NOT EXISTS"etag" text;--> statement-breakpoint
ALTER TABLE "dot-storage"."file" ADD COLUMN IF NOT EXISTS "cache_control" text;--> statement-breakpoint
ALTER TABLE "dot-storage"."file" ADD COLUMN IF NOT EXISTS "last_modified" timestamp;