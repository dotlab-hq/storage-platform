CREATE TABLE `activity_tag` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`activity_id` text NOT NULL,
	`tag` text NOT NULL,
	FOREIGN KEY (`activity_id`) REFERENCES `user_activity`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `tag_tag_idx` ON `activity_tag` (`tag`);--> statement-breakpoint
CREATE INDEX `tag_activityId_idx` ON `activity_tag` (`activity_id`);--> statement-breakpoint
CREATE TABLE `user_activity` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`event_type` text NOT NULL,
	`resource_type` text,
	`resource_id` text,
	`metadata` text DEFAULT '{}',
	`ip_address` text,
	`user_agent` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `activity_userId_idx` ON `user_activity` (`user_id`);--> statement-breakpoint
CREATE INDEX `activity_createdAt_idx` ON `user_activity` (`created_at`);