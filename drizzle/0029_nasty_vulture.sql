CREATE INDEX IF NOT EXISTS `file_isTrashed_idx` ON `file` (`is_trashed`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `file_deletionQueuedAt_idx` ON `file` (`deletion_queued_at`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `folder_isTrashed_idx` ON `folder` (`is_trashed`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `folder_deletionQueuedAt_idx` ON `folder` (`deletion_queued_at`);
