CREATE TABLE "dot-storage"."storage_provider" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"endpoint" text NOT NULL,
	"region" text NOT NULL,
	"bucket_name" text NOT NULL,
	"access_key_id_encrypted" text NOT NULL,
	"secret_access_key_encrypted" text NOT NULL,
	"storage_limit_bytes" bigint DEFAULT 53687091200 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "storage_provider_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "dot-storage"."user" ADD COLUMN "is_admin" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "dot-storage"."file" ADD COLUMN "provider_id" text;--> statement-breakpoint
CREATE INDEX "storageProvider_isActive_idx" ON "dot-storage"."storage_provider" USING btree ("is_active");--> statement-breakpoint
ALTER TABLE "dot-storage"."file" ADD CONSTRAINT "file_provider_id_storage_provider_id_fk" FOREIGN KEY ("provider_id") REFERENCES "dot-storage"."storage_provider"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "file_providerId_idx" ON "dot-storage"."file" USING btree ("provider_id");