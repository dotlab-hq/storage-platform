-- No-op: is_trashed / deletion_queued_at (and their indexes) are already
-- created by 0026 and 0029. Re-adding them failed every fresh database setup.
-- Databases that already applied this migration are unaffected.
SELECT 1;
