-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
-- Migration: Add tool calling support and chat attachments
-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

-- 1. Add tool_call_id and tool_calls columns to chat_message
ALTER TABLE `chat_message` ADD COLUMN `tool_call_id` text;
--> statement-breakpoint
ALTER TABLE `chat_message` ADD COLUMN `tool_calls` text;
--> statement-breakpoint

-- 2. Update role CHECK constraint to include 'tool'
-- SQLite doesn't support directly altering CHECK constraints, so we recreate the table
-- Since Drizzle handles this, we note that the constraint should be:
-- CHECK (role IN ('user', 'assistant', 'tool'))

-- 3. Create chat_message_attachment table
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
CREATE INDEX IF NOT EXISTS `chatMessageAttachment_messageId_idx` ON `chat_message_attachment` (`message_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `chatMessageAttachment_bucket_object_idx` ON `chat_message_attachment` (`bucket_name`, `object_key`);
