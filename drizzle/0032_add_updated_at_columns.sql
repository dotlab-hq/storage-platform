-- Migration: Add missing updated_at column (safe, non-destructive)

PRAGMA foreign_keys=off;

-- Add missing updated_at column to folder table if it doesn't exist
ALTER TABLE folder ADD COLUMN IF NOT EXISTS updated_at integer NOT NULL DEFAULT (cast(strftime('%s', 'now') as integer));

-- Add missing updated_at column to file table if it doesn't exist
ALTER TABLE file ADD COLUMN IF NOT EXISTS updated_at integer NOT NULL DEFAULT (cast(strftime('%s', 'now') as integer));

PRAGMA foreign_keys=on;