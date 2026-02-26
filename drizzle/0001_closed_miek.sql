CREATE TABLE "dot-storage"."file" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"object_key" text NOT NULL,
	"mime_type" text,
	"size_in_bytes" bigint NOT NULL,
	"user_id" text NOT NULL,
	"folder_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dot-storage"."file_share" (
	"id" text PRIMARY KEY NOT NULL,
	"file_id" text NOT NULL,
	"shared_by_user_id" text NOT NULL,
	"share_token" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "file_share_share_token_unique" UNIQUE("share_token")
);
--> statement-breakpoint
CREATE TABLE "dot-storage"."folder" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"user_id" text NOT NULL,
	"parent_folder_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dot-storage"."user_storage" (
	"user_id" text PRIMARY KEY NOT NULL,
	"allocated_storage" bigint DEFAULT 5368709120 NOT NULL,
	"used_storage" bigint DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dot-storage"."file" ADD CONSTRAINT "file_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "dot-storage"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dot-storage"."file" ADD CONSTRAINT "file_folder_id_folder_id_fk" FOREIGN KEY ("folder_id") REFERENCES "dot-storage"."folder"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dot-storage"."file_share" ADD CONSTRAINT "file_share_file_id_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "dot-storage"."file"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dot-storage"."file_share" ADD CONSTRAINT "file_share_shared_by_user_id_user_id_fk" FOREIGN KEY ("shared_by_user_id") REFERENCES "dot-storage"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dot-storage"."folder" ADD CONSTRAINT "folder_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "dot-storage"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dot-storage"."folder" ADD CONSTRAINT "folder_parent_folder_id_folder_id_fk" FOREIGN KEY ("parent_folder_id") REFERENCES "dot-storage"."folder"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dot-storage"."user_storage" ADD CONSTRAINT "user_storage_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "dot-storage"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "file_userId_idx" ON "dot-storage"."file" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "file_folderId_idx" ON "dot-storage"."file" USING btree ("folder_id");--> statement-breakpoint
CREATE INDEX "fileShare_fileId_idx" ON "dot-storage"."file_share" USING btree ("file_id");--> statement-breakpoint
CREATE INDEX "fileShare_sharedByUserId_idx" ON "dot-storage"."file_share" USING btree ("shared_by_user_id");--> statement-breakpoint
CREATE INDEX "folder_userId_idx" ON "dot-storage"."folder" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "folder_parentFolderId_idx" ON "dot-storage"."folder" USING btree ("parent_folder_id");--> statement-breakpoint
CREATE INDEX "userStorage_userId_idx" ON "dot-storage"."user_storage" USING btree ("user_id");