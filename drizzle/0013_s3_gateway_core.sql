CREATE TABLE "dot-storage"."virtual_bucket" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"mapped_folder_id" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dot-storage"."upload_attempt" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"bucket_id" text NOT NULL,
	"provider_id" text,
	"object_key" text NOT NULL,
	"upstream_object_key" text NOT NULL,
	"expected_size" bigint NOT NULL,
	"content_type" text,
	"etag" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"expires_at" timestamp NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dot-storage"."virtual_bucket" ADD CONSTRAINT "virtual_bucket_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "dot-storage"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "dot-storage"."virtual_bucket" ADD CONSTRAINT "virtual_bucket_mapped_folder_id_folder_id_fk" FOREIGN KEY ("mapped_folder_id") REFERENCES "dot-storage"."folder"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "dot-storage"."upload_attempt" ADD CONSTRAINT "upload_attempt_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "dot-storage"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "dot-storage"."upload_attempt" ADD CONSTRAINT "upload_attempt_bucket_id_virtual_bucket_id_fk" FOREIGN KEY ("bucket_id") REFERENCES "dot-storage"."virtual_bucket"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "dot-storage"."upload_attempt" ADD CONSTRAINT "upload_attempt_provider_id_storage_provider_id_fk" FOREIGN KEY ("provider_id") REFERENCES "dot-storage"."storage_provider"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "virtualBucket_userId_name_unq" ON "dot-storage"."virtual_bucket" USING btree ("user_id","name");
--> statement-breakpoint
CREATE INDEX "virtualBucket_userId_idx" ON "dot-storage"."virtual_bucket" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "virtualBucket_mappedFolderId_idx" ON "dot-storage"."virtual_bucket" USING btree ("mapped_folder_id");
--> statement-breakpoint
CREATE INDEX "uploadAttempt_userId_idx" ON "dot-storage"."upload_attempt" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "uploadAttempt_bucketId_idx" ON "dot-storage"."upload_attempt" USING btree ("bucket_id");
--> statement-breakpoint
CREATE INDEX "uploadAttempt_status_idx" ON "dot-storage"."upload_attempt" USING btree ("status");
--> statement-breakpoint
CREATE INDEX "uploadAttempt_providerId_idx" ON "dot-storage"."upload_attempt" USING btree ("provider_id");