ALTER TABLE `qr_login_offer` ADD `claimed_by_user_id` text REFERENCES user(id);--> statement-breakpoint
ALTER TABLE `qr_login_offer` ADD `requested_permission` text;