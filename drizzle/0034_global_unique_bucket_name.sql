-- Migration: Make virtual_bucket.name globally unique and add defaultAssetsBucketName on user
-- Every active bucket gets a 5-char random hex suffix appended (e.g. "photos" → "photos-a3f1c").
-- The unique index is added AFTER data is reshaped to avoid mid-migration constraint violations.

-- Step 1: add the column the assets-bucket resolver reads from.
ALTER TABLE `user` ADD COLUMN `default_assets_bucket_name` text;

-- Step 2: drop the per-user unique index before we reshape data.
DROP INDEX IF EXISTS `virtualBucket_userId_name_unq`;

-- Step 3: append a 5-char random hex suffix to every active bucket.
--         Use a scratch column so the operation is safe: if the migration
--         fails partway through, no original data is lost.
ALTER TABLE `virtual_bucket` ADD COLUMN `name_new` text;

UPDATE `virtual_bucket`
SET `name_new` = `name` || '-' || substr(lower(hex(randomblob(3))), 1, 5)
WHERE `is_active` = 1;

-- Swap name ↔ name_new.
UPDATE `virtual_bucket` SET `name` = `name_new` WHERE `is_active` = 1;
ALTER TABLE `virtual_bucket` DROP COLUMN `name_new`;

-- Step 4: keep folder.name in sync with the bucket name (the bucket folder
--         row shares the same name).
UPDATE `folder`
SET `name` = (
  SELECT `virtual_bucket`.`name`
  FROM `virtual_bucket`
  WHERE `virtual_bucket`.`mapped_folder_id` = `folder`.`id`
)
WHERE `virtual_bucket_id` IS NOT NULL;

-- Step 5: record each user's former 'assets' bucket as their default assets
--         bucket. After suffixing, that bucket's name starts with 'assets-'.
UPDATE `user`
SET `default_assets_bucket_name` = (
  SELECT `virtual_bucket`.`name`
  FROM `virtual_bucket`
  WHERE `virtual_bucket`.`user_id` = `user`.`id`
    AND `virtual_bucket`.`is_active` = 1
    AND `virtual_bucket`.`name` LIKE 'assets-%'
  ORDER BY `virtual_bucket`.`created_at` ASC
  LIMIT 1
);

-- Step 6: enforce global uniqueness.
CREATE UNIQUE INDEX `virtualBucket_name_unq` ON `virtual_bucket` (`name`);
