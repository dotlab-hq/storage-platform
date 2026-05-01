-- Migration: Reset deleted_at and deletion_queued_at for deleted entries (safe, data-preserving)
-- This only updates rows where is_deleted = 1, preserving all other data

UPDATE folder SET deleted_at = NULL, deletion_queued_at = NULL WHERE is_deleted = 1;
UPDATE file SET deleted_at = NULL, deletion_queued_at = NULL WHERE is_deleted = 1;