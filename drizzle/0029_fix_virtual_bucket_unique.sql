-- Migration: Fix duplicate virtualBucket_userId_name_unq index
-- Drop if exists then recreate with IF NOT EXISTS

PRAGMA foreign_keys = off;

DROP INDEX IF EXISTS virtualBucket_userId_name_unq;

CREATE UNIQUE INDEX IF NOT EXISTS virtualBucket_userId_name_unq ON virtual_bucket (user_id, name);

PRAGMA foreign_keys = on;