ALTER TABLE "dot-storage"."file"
ADD COLUMN "etag" text;
--> statement-breakpoint
ALTER TABLE "dot-storage"."file"
ADD COLUMN "cache_control" text;
--> statement-breakpoint
ALTER TABLE "dot-storage"."file"
ADD COLUMN "last_modified" timestamp;
--> statement-breakpoint
UPDATE "dot-storage"."file"
SET "last_modified" = COALESCE("updated_at", "created_at")
WHERE "last_modified" IS NULL;
