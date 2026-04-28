-- Migration: Reset deleted_at and deletion_queued_at for all isDeleted entries

UPDATE folder SET deleted_at = NULL, deletion_queued_at = NULL WHERE is_deleted = 1;
UPDATE file SET deleted_at = NULL, deletion_queued_at = NULL WHERE is_deleted = 1;