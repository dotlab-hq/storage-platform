-- No-op: file.updated_at and folder.updated_at already exist in the base
-- schema (0000). The original statement used `ADD COLUMN IF NOT EXISTS`,
-- which SQLite/D1 does not support, so it failed on every database.
SELECT 1;
