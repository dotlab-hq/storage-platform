CREATE TABLE IF NOT EXISTS `chat_message_attachment` (
	`id` text PRIMARY KEY NOT NULL,
	`message_id` text NOT NULL,
	`bucket_name` text NOT NULL,
	`object_key` text NOT NULL,
	`filename` text NOT NULL,
	`mime_type` text,
	`size_bytes` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`message_id`) REFERENCES `chat_message`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `chatMessageAttachment_messageId_idx` ON `chat_message_attachment` (`message_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `chatMessageAttachment_bucket_object_idx` ON `chat_message_attachment` (`bucket_name`,`object_key`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `__new_chat_message` (
	`id` text PRIMARY KEY NOT NULL,
	`thread_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`tool_call_id` text,
	`tool_calls` text,
	`regeneration_count` integer DEFAULT 0 NOT NULL,
	`is_deleted` integer DEFAULT false NOT NULL,
	`deleted_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`thread_id`) REFERENCES `chat_thread`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "chat_message_role_check" CHECK("__new_chat_message"."role" IN ('user', 'assistant', 'tool'))
);
--> statement-breakpoint
INSERT INTO `__new_chat_message`("id", "thread_id", "user_id", "role", "content", "tool_call_id", "tool_calls", "regeneration_count", "is_deleted", "deleted_at", "created_at", "updated_at") SELECT "id", "thread_id", "user_id", "role", "content", "tool_call_id", "tool_calls", "regeneration_count", "is_deleted", "deleted_at", "created_at", "updated_at" FROM `chat_message`;--> statement-breakpoint
DROP TABLE `chat_message`;--> statement-breakpoint
ALTER TABLE `__new_chat_message` RENAME TO `chat_message`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `chatMessage_threadId_idx` ON `chat_message` (`thread_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `chatMessage_userId_idx` ON `chat_message` (`user_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `chatMessage_createdAt_idx` ON `chat_message` (`created_at`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `chatMessage_isDeleted_idx` ON `chat_message` (`is_deleted`);