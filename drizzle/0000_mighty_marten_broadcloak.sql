CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `account_userId_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	`impersonated_by` text,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE TABLE `two_factor` (
	`id` text PRIMARY KEY NOT NULL,
	`secret` text NOT NULL,
	`backup_codes` text NOT NULL,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `twoFactor_secret_idx` ON `two_factor` (`secret`);--> statement-breakpoint
CREATE INDEX `twoFactor_userId_idx` ON `two_factor` (`user_id`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`role` text,
	`banned` integer DEFAULT false,
	`ban_reason` text,
	`ban_expires` integer,
	`two_factor_enabled` integer DEFAULT false,
	`is_admin` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);--> statement-breakpoint
CREATE TABLE `upload_attempt` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`bucket_id` text NOT NULL,
	`provider_id` text,
	`object_key` text NOT NULL,
	`upstream_object_key` text NOT NULL,
	`expected_size` integer NOT NULL,
	`content_type` text,
	`etag` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`error_message` text,
	`expires_at` integer NOT NULL,
	`completed_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`bucket_id`) REFERENCES `virtual_bucket`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`provider_id`) REFERENCES `storage_provider`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `uploadAttempt_userId_idx` ON `upload_attempt` (`user_id`);--> statement-breakpoint
CREATE INDEX `uploadAttempt_bucketId_idx` ON `upload_attempt` (`bucket_id`);--> statement-breakpoint
CREATE INDEX `uploadAttempt_status_idx` ON `upload_attempt` (`status`);--> statement-breakpoint
CREATE INDEX `uploadAttempt_providerId_idx` ON `upload_attempt` (`provider_id`);--> statement-breakpoint
CREATE TABLE `virtual_bucket` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`mapped_folder_id` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`mapped_folder_id`) REFERENCES `folder`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `virtualBucket_userId_name_unq` ON `virtual_bucket` (`user_id`,`name`);--> statement-breakpoint
CREATE INDEX `virtualBucket_userId_idx` ON `virtual_bucket` (`user_id`);--> statement-breakpoint
CREATE INDEX `virtualBucket_mappedFolderId_idx` ON `virtual_bucket` (`mapped_folder_id`);--> statement-breakpoint
CREATE TABLE `storage_provider` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`endpoint` text DEFAULT 'undetermined' NOT NULL,
	`region` text DEFAULT 'undetermined' NOT NULL,
	`bucket_name` text DEFAULT 'undetermined' NOT NULL,
	`access_key_id_encrypted` text DEFAULT 'undetermined' NOT NULL,
	`secret_access_key_encrypted` text DEFAULT 'undetermined' NOT NULL,
	`storage_limit_bytes` integer DEFAULT 53687091200 NOT NULL,
	`file_size_limit_bytes` integer DEFAULT 53687091200 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `storage_provider_name_unique` ON `storage_provider` (`name`);--> statement-breakpoint
CREATE INDEX `storageProvider_isActive_idx` ON `storage_provider` (`is_active`);--> statement-breakpoint
CREATE TABLE `file` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`object_key` text NOT NULL,
	`mime_type` text,
	`etag` text,
	`cache_control` text,
	`last_modified` integer,
	`size_in_bytes` integer NOT NULL,
	`user_id` text NOT NULL,
	`provider_id` text,
	`folder_id` text,
	`is_privately_locked` integer DEFAULT false NOT NULL,
	`is_deleted` integer DEFAULT false NOT NULL,
	`deleted_at` integer,
	`last_opened_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`provider_id`) REFERENCES `storage_provider`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`folder_id`) REFERENCES `folder`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `file_userId_idx` ON `file` (`user_id`);--> statement-breakpoint
CREATE INDEX `file_providerId_idx` ON `file` (`provider_id`);--> statement-breakpoint
CREATE INDEX `file_folderId_idx` ON `file` (`folder_id`);--> statement-breakpoint
CREATE TABLE `folder` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`user_id` text NOT NULL,
	`parent_folder_id` text,
	`virtual_bucket_id` text,
	`is_privately_locked` integer DEFAULT false NOT NULL,
	`is_deleted` integer DEFAULT false NOT NULL,
	`deleted_at` integer,
	`last_opened_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`parent_folder_id`) REFERENCES `folder`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `folder_virtual_bucket_id_unique` ON `folder` (`virtual_bucket_id`);--> statement-breakpoint
CREATE INDEX `folder_userId_idx` ON `folder` (`user_id`);--> statement-breakpoint
CREATE INDEX `folder_parentFolderId_idx` ON `folder` (`parent_folder_id`);--> statement-breakpoint
CREATE TABLE `share_link` (
	`id` text PRIMARY KEY NOT NULL,
	`file_id` text,
	`folder_id` text,
	`shared_by_user_id` text NOT NULL,
	`share_token` text NOT NULL,
	`requires_auth` integer DEFAULT false NOT NULL,
	`consented_privately_unlock` integer DEFAULT false NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`expires_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`file_id`) REFERENCES `file`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`folder_id`) REFERENCES `folder`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`shared_by_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "share_link_target_check" CHECK(("file_id" IS NOT NULL AND "folder_id" IS NULL) OR ("file_id" IS NULL AND "folder_id" IS NOT NULL))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `share_link_share_token_unique` ON `share_link` (`share_token`);--> statement-breakpoint
CREATE INDEX `shareLink_fileId_idx` ON `share_link` (`file_id`);--> statement-breakpoint
CREATE INDEX `shareLink_folderId_idx` ON `share_link` (`folder_id`);--> statement-breakpoint
CREATE INDEX `shareLink_sharedByUserId_idx` ON `share_link` (`shared_by_user_id`);--> statement-breakpoint
CREATE TABLE `user_storage` (
	`user_id` text PRIMARY KEY NOT NULL,
	`allocated_storage` integer DEFAULT 524288000 NOT NULL,
	`file_size_limit` integer DEFAULT 52428800 NOT NULL,
	`used_storage` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `userStorage_userId_idx` ON `user_storage` (`user_id`);