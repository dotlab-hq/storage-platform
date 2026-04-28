CREATE TABLE IF NOT EXISTS `device_code` (
    `id` text PRIMARY KEY NOT NULL,
    `device_code` text NOT NULL,
    `user_code` text NOT NULL,
    `user_id` text,
    `client_id` text NOT NULL,
    `scope` text,
    `status` text DEFAULT 'pending' NOT NULL,
    `expires_at` integer NOT NULL,
    `last_polled_at` integer,
    `polling_interval` integer DEFAULT 5,
    FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `device_code_user_code_unique` ON `device_code` (`user_code`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `deviceCode_deviceCode_idx` ON `device_code` (`device_code`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `deviceCode_userCode_idx` ON `device_code` (`user_code`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `deviceCode_userId_idx` ON `device_code` (`user_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `deviceCode_status_idx` ON `device_code` (`status`);