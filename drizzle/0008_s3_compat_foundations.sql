ALTER TABLE "virtual_bucket"
ADD COLUMN "region" text DEFAULT 'us-east-1' NOT NULL;

ALTER TABLE "virtual_bucket"
ADD COLUMN "versioning_state" text DEFAULT 'disabled' NOT NULL;

ALTER TABLE "virtual_bucket"
ADD COLUMN "object_ownership_mode" text DEFAULT 'bucket-owner-preferred' NOT NULL;

ALTER TABLE "virtual_bucket"
ADD COLUMN "block_public_access" integer DEFAULT 1 NOT NULL;

ALTER TABLE "virtual_bucket" ADD COLUMN "created_by_user_id" text;

CREATE INDEX "virtualBucket_isActive_idx" ON "virtual_bucket" ("is_active");

ALTER TABLE "upload_attempt" ADD COLUMN "upload_id" text;

ALTER TABLE "upload_attempt" ADD COLUMN "initiated_by_user_id" text;

ALTER TABLE "upload_attempt" ADD COLUMN "checksum_algorithm" text;

ALTER TABLE "upload_attempt" ADD COLUMN "encryption_mode" text;

ALTER TABLE "upload_attempt" ADD COLUMN "storage_class" text;

CREATE UNIQUE INDEX "uploadAttempt_uploadId_unq" ON "upload_attempt" ("upload_id");

CREATE INDEX "uploadAttempt_uploadId_idx" ON "upload_attempt" ("upload_id");

CREATE TABLE "multipart_upload_part" (
    "id" text PRIMARY KEY NOT NULL,
    "upload_attempt_id" text NOT NULL,
    "part_number" integer NOT NULL,
    "etag" text,
    "size_in_bytes" integer DEFAULT 0 NOT NULL,
    "checksum_value" text,
    "upstream_part_locator" text,
    "created_at" integer NOT NULL,
    FOREIGN KEY ("upload_attempt_id") REFERENCES "upload_attempt" ("id") ON DELETE cascade
);

CREATE UNIQUE INDEX "multipartUploadPart_uploadAttempt_partNumber_unq" ON "multipart_upload_part" (
    "upload_attempt_id",
    "part_number"
);

CREATE INDEX "multipartUploadPart_uploadAttempt_idx" ON "multipart_upload_part" ("upload_attempt_id");

CREATE TABLE "bucket_policy" (
    "id" text PRIMARY KEY NOT NULL,
    "bucket_id" text NOT NULL,
    "policy_json" text NOT NULL,
    "etag" text,
    "created_at" integer NOT NULL,
    "updated_at" integer NOT NULL,
    FOREIGN KEY ("bucket_id") REFERENCES "virtual_bucket" ("id") ON DELETE cascade
);

CREATE UNIQUE INDEX "bucketPolicy_bucket_unq" ON "bucket_policy" ("bucket_id");

CREATE TABLE "bucket_acl" (
    "id" text PRIMARY KEY NOT NULL,
    "bucket_id" text NOT NULL,
    "owner_canonical_id" text NOT NULL,
    "canned_acl" text DEFAULT 'private' NOT NULL,
    "grants_json" text,
    "updated_at" integer NOT NULL,
    FOREIGN KEY ("bucket_id") REFERENCES "virtual_bucket" ("id") ON DELETE cascade
);

CREATE UNIQUE INDEX "bucketAcl_bucket_unq" ON "bucket_acl" ("bucket_id");

CREATE TABLE "bucket_cors_rule" (
    "id" text PRIMARY KEY NOT NULL,
    "bucket_id" text NOT NULL,
    "rule_order" integer NOT NULL,
    "allowed_origins_json" text NOT NULL,
    "allowed_methods_json" text NOT NULL,
    "allowed_headers_json" text,
    "expose_headers_json" text,
    "max_age_seconds" integer,
    FOREIGN KEY ("bucket_id") REFERENCES "virtual_bucket" ("id") ON DELETE cascade
);

CREATE UNIQUE INDEX "bucketCorsRule_bucket_order_unq" ON "bucket_cors_rule" ("bucket_id", "rule_order");

CREATE INDEX "bucketCorsRule_bucket_idx" ON "bucket_cors_rule" ("bucket_id");

CREATE TABLE "object_acl" (
    "id" text PRIMARY KEY NOT NULL,
    "file_id" text NOT NULL,
    "owner_canonical_id" text NOT NULL,
    "canned_acl" text DEFAULT 'private' NOT NULL,
    "grants_json" text,
    "updated_at" integer NOT NULL,
    FOREIGN KEY ("file_id") REFERENCES "file" ("id") ON DELETE cascade
);

CREATE UNIQUE INDEX "objectAcl_file_unq" ON "object_acl" ("file_id");

CREATE TABLE "file_tag" (
    "id" text PRIMARY KEY NOT NULL,
    "file_id" text NOT NULL,
    "tag_key" text NOT NULL,
    "tag_value" text NOT NULL,
    "created_at" integer NOT NULL,
    "updated_at" integer NOT NULL,
    FOREIGN KEY ("file_id") REFERENCES "file" ("id") ON DELETE cascade
);

CREATE UNIQUE INDEX "fileTag_file_tagKey_unq" ON "file_tag" ("file_id", "tag_key");

CREATE INDEX "fileTag_file_idx" ON "file_tag" ("file_id");

CREATE TABLE "file_version" (
    "id" text PRIMARY KEY NOT NULL,
    "bucket_id" text NOT NULL,
    "file_id" text,
    "object_key" text NOT NULL,
    "version_id" text NOT NULL,
    "is_delete_marker" integer DEFAULT 0 NOT NULL,
    "etag" text,
    "size_in_bytes" integer DEFAULT 0 NOT NULL,
    "content_type" text,
    "storage_provider_id" text,
    "upstream_object_key" text,
    "created_at" integer NOT NULL,
    "created_by_user_id" text,
    FOREIGN KEY ("bucket_id") REFERENCES "virtual_bucket" ("id") ON DELETE cascade,
    FOREIGN KEY ("file_id") REFERENCES "file" ("id") ON DELETE set null,
    FOREIGN KEY ("storage_provider_id") REFERENCES "storage_provider" ("id") ON DELETE set null
);

CREATE UNIQUE INDEX "fileVersion_bucket_key_version_unq" ON "file_version" (
    "bucket_id",
    "object_key",
    "version_id"
);

CREATE INDEX "fileVersion_bucket_key_created_idx" ON "file_version" (
    "bucket_id",
    "object_key",
    "created_at"
);

CREATE TABLE "api_key" (
    "id" text PRIMARY KEY NOT NULL,
    "user_id" text NOT NULL,
    "access_key_id" text NOT NULL,
    "secret_key_hash" text NOT NULL,
    "secret_key_last4" text NOT NULL,
    "status" text DEFAULT 'active' NOT NULL,
    "created_at" integer NOT NULL,
    "expires_at" integer,
    "last_used_at" integer,
    FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE cascade
);

CREATE UNIQUE INDEX "apiKey_accessKeyId_unq" ON "api_key" ("access_key_id");

CREATE INDEX "apiKey_userId_idx" ON "api_key" ("user_id");

CREATE TABLE "object_encryption_metadata" (
    "id" text PRIMARY KEY NOT NULL,
    "file_id" text NOT NULL,
    "mode" text DEFAULT 'SSE-S3' NOT NULL,
    "kms_key_id" text,
    "encrypted_at" integer NOT NULL,
    FOREIGN KEY ("file_id") REFERENCES "file" ("id") ON DELETE cascade
);

CREATE UNIQUE INDEX "objectEncryptionMetadata_file_unq" ON "object_encryption_metadata" ("file_id");

CREATE TABLE "s3_request_audit" (
    "id" text PRIMARY KEY NOT NULL,
    "request_id" text NOT NULL,
    "user_id" text,
    "access_key_id" text,
    "bucket_name" text NOT NULL,
    "object_key" text,
    "operation" text NOT NULL,
    "http_status" integer NOT NULL,
    "error_code" text,
    "duration_ms" integer NOT NULL,
    "source_ip" text,
    "user_agent" text,
    "created_at" integer NOT NULL,
    FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE set null
);

CREATE INDEX "s3RequestAudit_bucket_idx" ON "s3_request_audit" ("bucket_name");

CREATE INDEX "s3RequestAudit_createdAt_idx" ON "s3_request_audit" ("created_at");