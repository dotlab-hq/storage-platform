-- Migration: Fix duplicate index error
-- Drops the storageProvider_isActive_idx if it exists, then ensures it's created.

PRAGMA foreign_keys = off;

DROP INDEX IF EXISTS storageProvider_isActive_idx;

-- Ensure the index exists (CREATE INDEX IF NOT EXISTS is safe)
CREATE INDEX IF NOT EXISTS storageProvider_isActive_idx ON storage_provider (is_active);

PRAGMA foreign_keys = on;