CREATE TABLE "dot-storage"."share_link" (
	"id" text PRIMARY KEY NOT NULL,
	"file_id" text,
	"folder_id" text,
	"shared_by_user_id" text NOT NULL,
	"share_token" text NOT NULL,
	"requires_auth" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "share_link_share_token_unique" UNIQUE("share_token"),
	CONSTRAINT "share_link_target_check" CHECK (("file_id" IS NOT NULL AND "folder_id" IS NULL) OR ("file_id" IS NULL AND "folder_id" IS NOT NULL))
);
--> statement-breakpoint
DROP TABLE "dot-storage"."file_share" CASCADE;--> statement-breakpoint
ALTER TABLE "dot-storage"."file" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "dot-storage"."file" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "dot-storage"."file" ADD COLUMN "last_opened_at" timestamp;--> statement-breakpoint
ALTER TABLE "dot-storage"."folder" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "dot-storage"."folder" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "dot-storage"."folder" ADD COLUMN "last_opened_at" timestamp;--> statement-breakpoint
ALTER TABLE "dot-storage"."share_link" ADD CONSTRAINT "share_link_file_id_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "dot-storage"."file"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dot-storage"."share_link" ADD CONSTRAINT "share_link_folder_id_folder_id_fk" FOREIGN KEY ("folder_id") REFERENCES "dot-storage"."folder"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dot-storage"."share_link" ADD CONSTRAINT "share_link_shared_by_user_id_user_id_fk" FOREIGN KEY ("shared_by_user_id") REFERENCES "dot-storage"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "shareLink_fileId_idx" ON "dot-storage"."share_link" USING btree ("file_id");--> statement-breakpoint
CREATE INDEX "shareLink_folderId_idx" ON "dot-storage"."share_link" USING btree ("folder_id");--> statement-breakpoint
CREATE INDEX "shareLink_sharedByUserId_idx" ON "dot-storage"."share_link" USING btree ("shared_by_user_id");