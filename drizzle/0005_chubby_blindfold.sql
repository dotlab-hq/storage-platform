CREATE TABLE `device_transfer` (
	`id` text PRIMARY KEY NOT NULL,
	`file_id` text NOT NULL,
	`sender_user_id` text,
	`receiver_session_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`expires_at` integer NOT NULL,
	`completed_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`sender_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `deviceTransfer_receiverSessionId_idx` ON `device_transfer` (`receiver_session_id`);--> statement-breakpoint
CREATE INDEX `deviceTransfer_senderUserId_idx` ON `device_transfer` (`sender_user_id`);--> statement-breakpoint
CREATE INDEX `deviceTransfer_status_idx` ON `device_transfer` (`status`);