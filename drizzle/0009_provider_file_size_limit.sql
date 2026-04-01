ALTER TABLE "dot-storage"."storage_provider"
ADD COLUMN "file_size_limit_bytes" bigint NOT NULL DEFAULT 53687091200;

UPDATE "dot-storage"."storage_provider"
SET "file_size_limit_bytes" = "storage_limit_bytes"
WHERE "file_size_limit_bytes" IS NULL OR "file_size_limit_bytes" <= 0;