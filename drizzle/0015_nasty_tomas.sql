CREATE TABLE IF NOT EXISTS `apikey` (
    `id` text PRIMARY KEY NOT NULL,
    `name` text,
    `start` text,
    `prefix` text,
    `key` text NOT NULL,
    `user_id` text NOT NULL,
    `refill_interval` integer,
    `refill_amount` integer,
    `last_refill_at` integer,
    `enabled` integer DEFAULT true,
    `rate_limit_enabled` integer DEFAULT true,
    `rate_limit_time_window` integer DEFAULT 86400000,
    `rate_limit_max` integer DEFAULT 10,
    `request_count` integer DEFAULT 0,
    `remaining` integer,
    `last_request` integer,
    `expires_at` integer,
    `created_at` integer NOT NULL,
    `updated_at` integer NOT NULL,
    `permissions` text,
    `metadata` text,
    FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `apikey_key_idx` ON `apikey` (`key`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `apikey_userId_idx` ON `apikey` (`user_id`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `chat_message` (
	`id` text PRIMARY KEY NOT NULL,
	`thread_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`regeneration_count` integer DEFAULT 0 NOT NULL,
	`is_deleted` integer DEFAULT false NOT NULL,
	`deleted_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`thread_id`) REFERENCES `chat_thread`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "chat_message_role_check" CHECK("chat_message"."role" IN ('user', 'assistant'))
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `chatMessage_threadId_idx` ON `chat_message` (`thread_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `chatMessage_userId_idx` ON `chat_message` (`user_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `chatMessage_createdAt_idx` ON `chat_message` (`created_at`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `chatMessage_isDeleted_idx` ON `chat_message` (`is_deleted`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `chat_message_version` (
    `id` text PRIMARY KEY NOT NULL,
    `message_id` text NOT NULL,
    `content` text NOT NULL,
    `version_number` integer NOT NULL,
    `created_at` integer NOT NULL,
    FOREIGN KEY (`message_id`) REFERENCES `chat_message` (`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `chatMessageVersion_messageId_idx` ON `chat_message_version` (`message_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `chatMessageVersion_versionNumber_idx` ON `chat_message_version` (`version_number`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `chat_thread` (
    `id` text PRIMARY KEY NOT NULL,
    `user_id` text NOT NULL,
    `title` text NOT NULL,
    `latest_preview` text,
    `last_message_at` integer NOT NULL,
    `is_deleted` integer DEFAULT false NOT NULL,
    `deleted_at` integer,
    `created_at` integer NOT NULL,
    `updated_at` integer NOT NULL,
    FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `chatThread_userId_idx` ON `chat_thread` (`user_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `chatThread_lastMessageAt_idx` ON `chat_thread` (`last_message_at`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `chatThread_isDeleted_idx` ON `chat_thread` (`is_deleted`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `file_summary_event` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text NOT NULL,
	`status` text NOT NULL,
	`message` text,
	`detail_json` text DEFAULT '{}' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`job_id`) REFERENCES `file_summary_job`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "file_summary_event_status_check" CHECK("file_summary_event"."status" IN ('queued','processing','completed','failed'))
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `fileSummaryEvent_jobId_idx` ON `file_summary_event` (`job_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `fileSummaryEvent_createdAt_idx` ON `file_summary_event` (`created_at`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `file_summary_job` (
	`id` text PRIMARY KEY NOT NULL,
	`file_id` text NOT NULL,
	`user_id` text NOT NULL,
	`model` text NOT NULL,
	`status` text DEFAULT 'queued' NOT NULL,
	`source_type` text DEFAULT 'metadata-wave' NOT NULL,
	`is_large_file` integer DEFAULT false NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`summary_text` text,
	`metadata_json` text DEFAULT '{}' NOT NULL,
	`failure_reason` text,
	`started_at` integer,
	`completed_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`file_id`) REFERENCES `file`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "file_summary_job_status_check" CHECK("file_summary_job"."status" IN ('queued','processing','completed','failed')),
	CONSTRAINT "file_summary_job_source_check" CHECK("file_summary_job"."source_type" IN ('metadata-wave','text-content','media-metadata','binary-metadata'))
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `fileSummaryJob_fileId_idx` ON `file_summary_job` (`file_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `fileSummaryJob_userId_idx` ON `file_summary_job` (`user_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `fileSummaryJob_status_idx` ON `file_summary_job` (`status`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `fileSummaryJob_updatedAt_idx` ON `file_summary_job` (`updated_at`);
--> statement-breakpoint
DROP TABLE IF EXISTS `qr_login_offer`;
--> statement-breakpoint
DROP TABLE IF EXISTS `tiny_session`;
--> statement-breakpoint
DROP TABLE IF EXISTS `webrtc_transfer`;