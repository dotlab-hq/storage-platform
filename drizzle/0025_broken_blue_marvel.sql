DROP INDEX `storage_provider_name_unique`;--> statement-breakpoint
ALTER TABLE `storage_provider` ADD `user_id` text REFERENCES user(id);--> statement-breakpoint
CREATE INDEX `storageProvider_userId_idx` ON `storage_provider` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `storageProvider_userId_name_unq` ON `storage_provider` (`user_id`,`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `storageProvider_system_name_unq` ON `storage_provider` (`name`) WHERE user_id IS NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `use_system_providers` integer DEFAULT true NOT NULL;