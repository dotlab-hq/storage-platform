-- Migration: Add is_trashed and deletion_queued_at columns (safe, non-destructive)

PRAGMA foreign_keys=off;

-- Add is_trashed and deletion_queued_at to folder table if they don't exist
ALTER TABLE folder ADD COLUMN is_trashed integer DEFAULT 0 NOT NULL;
ALTER TABLE folder ADD COLUMN deletion_queued_at integer;

-- Add is_trashed and deletion_queued_at to file table if they don't exist
ALTER TABLE file ADD COLUMN is_trashed integer DEFAULT 0 NOT NULL;
ALTER TABLE file ADD COLUMN deletion_queued_at integer;

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS folder_isTrashed_idx ON folder(is_trashed);
CREATE INDEX IF NOT EXISTS folder_deletionQueuedAt_idx ON folder(deletion_queued_at);
CREATE INDEX IF NOT EXISTS file_isTrashed_idx ON file(is_trashed);
CREATE INDEX IF NOT EXISTS file_deletionQueuedAt_idx ON file(deletion_queued_at);

PRAGMA foreign_keys=on;