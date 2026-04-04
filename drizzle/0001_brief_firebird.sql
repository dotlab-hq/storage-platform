CREATE TABLE `qr_login_offer` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`owner_user_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`expires_at` integer NOT NULL,
	`claimed_at` integer,
	FOREIGN KEY (`owner_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `qr_login_offer_code_unique` ON `qr_login_offer` (`code`);--> statement-breakpoint
CREATE INDEX `qrLoginOffer_ownerUserId_idx` ON `qr_login_offer` (`owner_user_id`);--> statement-breakpoint
CREATE INDEX `qrLoginOffer_status_idx` ON `qr_login_offer` (`status`);--> statement-breakpoint
CREATE INDEX `qrLoginOffer_expiresAt_idx` ON `qr_login_offer` (`expires_at`);--> statement-breakpoint
CREATE TABLE `tiny_session` (
	`id` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`user_id` text NOT NULL,
	`permission` text DEFAULT 'read' NOT NULL,
	`source_offer_id` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`expires_at` integer NOT NULL,
	`last_used_at` integer,
	`revoked_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`source_offer_id`) REFERENCES `qr_login_offer`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tiny_session_token_unique` ON `tiny_session` (`token`);--> statement-breakpoint
CREATE INDEX `tinySession_userId_idx` ON `tiny_session` (`user_id`);--> statement-breakpoint
CREATE INDEX `tinySession_expiresAt_idx` ON `tiny_session` (`expires_at`);--> statement-breakpoint
CREATE INDEX `tinySession_revokedAt_idx` ON `tiny_session` (`revoked_at`);