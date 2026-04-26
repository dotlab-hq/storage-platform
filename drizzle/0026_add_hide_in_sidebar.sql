-- Add hide_in_sidebar column to storage_provider table
ALTER TABLE `storage_provider` ADD COLUMN `hide_in_sidebar` INTEGER NOT NULL DEFAULT 0;
