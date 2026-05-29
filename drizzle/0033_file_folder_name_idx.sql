-- Migration: Add composite index for virtual-path file lookups (findStoredObject fallback)
-- This index supports WebDAV GET/HEAD for UI-uploaded files which are stored by (folderId, name)
-- rather than by S3-style upstream object key.

CREATE INDEX IF NOT EXISTS `file_user_folder_name_idx`
ON `file` (`user_id`, `folder_id`, `name`, `is_deleted`, `is_trashed`);
