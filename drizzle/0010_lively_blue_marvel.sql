CREATE TABLE IF NOT EXISTS `webrtc_transfer` (
    `id` text PRIMARY KEY NOT NULL,
    `offer_code` text NOT NULL,
    `poll_key` text NOT NULL,
    `owner_user_id` text,
    `offer_type` text DEFAULT 'offer' NOT NULL,
    `status` text DEFAULT 'pending' NOT NULL,
    `requester_session_id` text,
    `created_at` integer DEFAULT(
        cast(
            unixepoch ('subsecond') * 1000 as integer
        )
    ) NOT NULL,
    `expires_at` integer NOT NULL,
    `connected_at` integer,
    FOREIGN KEY (`owner_user_id`) REFERENCES `user` (`id`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (`requester_session_id`) REFERENCES `tiny_session` (`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `webrtc_transfer_offer_code_unique` ON `webrtc_transfer` (`offer_code`);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `webrtc_transfer_poll_key_unique` ON `webrtc_transfer` (`poll_key`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `webrtcTransfer_ownerUserId_idx` ON `webrtc_transfer` (`owner_user_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `webrtcTransfer_status_idx` ON `webrtc_transfer` (`status`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `webrtcTransfer_pollKey_idx` ON `webrtc_transfer` (`poll_key`);