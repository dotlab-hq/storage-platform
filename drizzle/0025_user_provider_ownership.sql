-- Add use_system_providers column to user table
ALTER TABLE `user` ADD COLUMN `use_system_providers` INTEGER NOT NULL DEFAULT 1;

-- Add user_id column to storage_provider with foreign key
ALTER TABLE `storage_provider` ADD COLUMN `user_id` TEXT REFERENCES `user`(`id`) ON DELETE CASCADE;

-- Drop old unique index on storage_provider.name
DROP INDEX IF EXISTS `storage_provider_name_unique`;

-- Create new indexes
CREATE INDEX IF NOT EXISTS `storageProvider_userId_idx` ON `storage_provider` (`user_id`);
CREATE UNIQUE INDEX IF NOT EXISTS `storageProvider_userId_name_unq` ON `storage_provider` (`user_id`, `name`);
CREATE UNIQUE INDEX IF NOT EXISTS `storageProvider_system_name_unq` ON `storage_provider` (`name`) WHERE `user_id` IS NULL;
