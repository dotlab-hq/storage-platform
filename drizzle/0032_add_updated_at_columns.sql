-- Migration: Add missing updated_at column to file and folder tables

PRAGMA foreign_keys=off;

-- Add missing updated_at column to folder table
ALTER TABLE folder ADD COLUMN IF NOT EXISTS updated_at integer NOT NULL DEFAULT (strftime('%s', 'now'));

-- Add missing updated_at column to file table  
ALTER TABLE file ADD COLUMN IF NOT EXISTS updated_at integer NOT NULL DEFAULT (strftime('%s', 'now'));

PRAGMA foreign_keys=on;