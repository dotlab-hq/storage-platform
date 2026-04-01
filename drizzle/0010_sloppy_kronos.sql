ALTER TABLE "dot-storage"."storage_provider" ALTER COLUMN "endpoint" SET DEFAULT 'undetermined';
--> statement-breakpoint
ALTER TABLE "dot-storage"."storage_provider" ALTER COLUMN "region" SET DEFAULT 'undetermined';
--> statement-breakpoint
ALTER TABLE "dot-storage"."storage_provider" ALTER COLUMN "bucket_name" SET DEFAULT 'undetermined';
--> statement-breakpoint
ALTER TABLE "dot-storage"."storage_provider" ALTER COLUMN "access_key_id_encrypted" SET DEFAULT 'undetermined';
--> statement-breakpoint
ALTER TABLE "dot-storage"."storage_provider" ALTER COLUMN "secret_access_key_encrypted" SET DEFAULT 'undetermined';
--> statement-breakpoint
ALTER TABLE "dot-storage"."storage_provider" ADD COLUMN IF NOT EXISTS "file_size_limit_bytes" bigint DEFAULT 53687091200 NOT NULL;