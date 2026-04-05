CREATE TABLE IF NOT EXISTS `bucket_acl` (
	`id` text PRIMARY KEY NOT NULL,
	`bucket_id` text NOT NULL,
	`owner_canonical_id` text NOT NULL,
	`canned_acl` text DEFAULT 'private' NOT NULL,
	`grants_json` text,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`bucket_id`) REFERENCES `virtual_bucket`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS `bucketAcl_bucket_unq` 
ON `bucket_acl` (`bucket_id`);
--> statement-breakpoint


CREATE TABLE IF NOT EXISTS `bucket_cors_rule` (
	`id` text PRIMARY KEY NOT NULL,
	`bucket_id` text NOT NULL,
	`rule_order` integer NOT NULL,
	`allowed_origins_json` text NOT NULL,
	`allowed_methods_json` text NOT NULL,
	`allowed_headers_json` text,
	`expose_headers_json` text,
	`max_age_seconds` integer,
	FOREIGN KEY (`bucket_id`) REFERENCES `virtual_bucket`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS `bucketCorsRule_bucket_order_unq` 
ON `bucket_cors_rule` (`bucket_id`,`rule_order`);

CREATE INDEX IF NOT EXISTS `bucketCorsRule_bucket_idx` 
ON `bucket_cors_rule` (`bucket_id`);
--> statement-breakpoint


CREATE TABLE IF NOT EXISTS `bucket_policy` (
	`id` text PRIMARY KEY NOT NULL,
	`bucket_id` text NOT NULL,
	`policy_json` text NOT NULL,
	`etag` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`bucket_id`) REFERENCES `virtual_bucket`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS `bucketPolicy_bucket_unq` 
ON `bucket_policy` (`bucket_id`);
--> statement-breakpoint


CREATE TABLE IF NOT EXISTS `file_tag` (
	`id` text PRIMARY KEY NOT NULL,
	`file_id` text NOT NULL,
	`tag_key` text NOT NULL,
	`tag_value` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`file_id`) REFERENCES `file`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS `fileTag_file_tagKey_unq` 
ON `file_tag` (`file_id`,`tag_key`);

CREATE INDEX IF NOT EXISTS `fileTag_file_idx` 
ON `file_tag` (`file_id`);
--> statement-breakpoint


CREATE TABLE IF NOT EXISTS `file_version` (
	`id` text PRIMARY KEY NOT NULL,
	`bucket_id` text NOT NULL,
	`file_id` text,
	`object_key` text NOT NULL,
	`version_id` text NOT NULL,
	`is_delete_marker` integer DEFAULT false NOT NULL,
	`etag` text,
	`size_in_bytes` integer DEFAULT 0 NOT NULL,
	`content_type` text,
	`storage_provider_id` text,
	`upstream_object_key` text,
	`created_at` integer NOT NULL,
	`created_by_user_id` text,
	FOREIGN KEY (`bucket_id`) REFERENCES `virtual_bucket`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`file_id`) REFERENCES `file`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`storage_provider_id`) REFERENCES `storage_provider`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`created_by_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS `fileVersion_bucket_key_version_unq` 
ON `file_version` (`bucket_id`,`object_key`,`version_id`);

CREATE INDEX IF NOT EXISTS `fileVersion_bucket_key_created_idx` 
ON `file_version` (`bucket_id`,`object_key`,`created_at`);
--> statement-breakpoint


CREATE TABLE IF NOT EXISTS `object_acl` (
	`id` text PRIMARY KEY NOT NULL,
	`file_id` text NOT NULL,
	`owner_canonical_id` text NOT NULL,
	`canned_acl` text DEFAULT 'private' NOT NULL,
	`grants_json` text,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`file_id`) REFERENCES `file`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS `objectAcl_file_unq` 
ON `object_acl` (`file_id`);
--> statement-breakpoint


CREATE TABLE IF NOT EXISTS `multipart_upload_part` (
	`id` text PRIMARY KEY NOT NULL,
	`upload_attempt_id` text NOT NULL,
	`part_number` integer NOT NULL,
	`etag` text,
	`size_in_bytes` integer DEFAULT 0 NOT NULL,
	`checksum_value` text,
	`upstream_part_locator` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`upload_attempt_id`) REFERENCES `upload_attempt`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS `multipartUploadPart_uploadAttempt_partNumber_unq` 
ON `multipart_upload_part` (`upload_attempt_id`,`part_number`);

CREATE INDEX IF NOT EXISTS `multipartUploadPart_uploadAttempt_idx` 
ON `multipart_upload_part` (`upload_attempt_id`);
--> statement-breakpoint


CREATE TABLE IF NOT EXISTS `api_key` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`access_key_id` text NOT NULL,
	`secret_key_hash` text NOT NULL,
	`secret_key_last4` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer,
	`last_used_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS `apiKey_accessKeyId_unq` 
ON `api_key` (`access_key_id`);

CREATE INDEX IF NOT EXISTS `apiKey_userId_idx` 
ON `api_key` (`user_id`);
--> statement-breakpoint


CREATE TABLE IF NOT EXISTS `object_encryption_metadata` (
	`id` text PRIMARY KEY NOT NULL,
	`file_id` text NOT NULL,
	`mode` text DEFAULT 'SSE-S3' NOT NULL,
	`kms_key_id` text,
	`encrypted_at` integer NOT NULL,
	FOREIGN KEY (`file_id`) REFERENCES `file`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS `objectEncryptionMetadata_file_unq` 
ON `object_encryption_metadata` (`file_id`);
--> statement-breakpoint


CREATE TABLE IF NOT EXISTS `s3_request_audit` (
	`id` text PRIMARY KEY NOT NULL,
	`request_id` text NOT NULL,
	`user_id` text,
	`access_key_id` text,
	`bucket_name` text NOT NULL,
	`object_key` text,
	`operation` text NOT NULL,
	`http_status` integer NOT NULL,
	`error_code` text,
	`duration_ms` integer NOT NULL,
	`source_ip` text,
	`user_agent` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint

CREATE INDEX IF NOT EXISTS `s3RequestAudit_bucket_idx` 
ON `s3_request_audit` (`bucket_name`);

CREATE INDEX IF NOT EXISTS `s3RequestAudit_createdAt_idx` 
ON `s3_request_audit` (`created_at`);