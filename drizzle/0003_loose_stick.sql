PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `__new_qr_login_offer` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`owner_user_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`claimed_by_user_id` text,
	`requested_permission` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`expires_at` integer NOT NULL,
	`claimed_at` integer,
	FOREIGN KEY (`owner_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`claimed_by_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_qr_login_offer`("id", "code", "owner_user_id", "status", "claimed_by_user_id", "requested_permission", "created_at", "expires_at", "claimed_at") SELECT "id", "code", "owner_user_id", "status", "claimed_by_user_id", "requested_permission", "created_at", "expires_at", "claimed_at" FROM `qr_login_offer`;--> statement-breakpoint
DROP TABLE `qr_login_offer`;--> statement-breakpoint
ALTER TABLE `__new_qr_login_offer` RENAME TO `qr_login_offer`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `qr_login_offer_code_unique` ON `qr_login_offer` (`code`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `qrLoginOffer_ownerUserId_idx` ON `qr_login_offer` (`owner_user_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `qrLoginOffer_status_idx` ON `qr_login_offer` (`status`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `qrLoginOffer_expiresAt_idx` ON `qr_login_offer` (`expires_at`);