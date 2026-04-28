-- Migration: Fix duplicate upload_attempt indexes
-- Drops unique/index on upload_id if they exist, then recreates them safely

PRAGMA foreign_keys = off;

DROP INDEX IF EXISTS uploadAttempt_uploadId_unq;

DROP INDEX IF EXISTS uploadAttempt_uploadId_idx;


CREATE UNIQUE INDEX IF NOT EXISTS uploadAttempt_uploadId_unq ON upload_attempt (upload_id);

CREATE INDEX IF NOT EXISTS uploadAttempt_uploadId_idx ON upload_attempt (upload_id);

PRAGMA foreign_keys = on;