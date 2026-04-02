ALTER TABLE "dot-storage"."upload_attempt"
ADD COLUMN "last_checked_at" timestamp;
--> statement-breakpoint
ALTER TABLE "dot-storage"."upload_attempt"
ADD COLUMN "next_check_after" timestamp;
--> statement-breakpoint
CREATE INDEX "uploadAttempt_pendingScan_idx"
ON "dot-storage"."upload_attempt"
USING btree ("status", "next_check_after", "expires_at");
