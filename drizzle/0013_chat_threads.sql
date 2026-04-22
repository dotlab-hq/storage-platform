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
	CONSTRAINT `chat_message_role_check` CHECK("chat_message"."role" IN ('user', 'assistant'))
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