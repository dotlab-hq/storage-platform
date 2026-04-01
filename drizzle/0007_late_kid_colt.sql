ALTER TABLE "dot-storage"."file" ADD COLUMN IF NOT EXISTS "is_privately_locked" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "dot-storage"."folder" ADD COLUMN IF NOT EXISTS "is_privately_locked" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "dot-storage"."share_link" ADD COLUMN IF NOT EXISTS "consented_privately_unlock" boolean DEFAULT false NOT NULL;