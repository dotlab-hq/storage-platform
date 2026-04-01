# Backblaze B2 Storage Provider Setup

This guide explains exactly how to configure Backblaze B2 as a storage provider for this project.

## 1) Prerequisites

- A Backblaze B2 account
- A B2 bucket (example: dot-storage)
- An application key with permissions for:
  - listBuckets
  - readFiles
  - writeFiles
  - listFiles
  - shareFiles
  - writeBuckets
  - readBuckets

## 2) Required Provider Values

Use these values in the admin provider form.

- Name: any readable provider name (example: Backblaze EU Central)
- Endpoint: https://s3.eu-central-003.backblazeb2.com
- Region: eu-central-003
- Bucket Name: your bucket name (example: dot-storage)
- Access Key ID: your Backblaze application key ID
- Secret Access Key: your Backblaze application key
- Storage Limit (bytes): max storage you want this provider to use
- File-Size Limit (bytes): max single file size allowed for this provider
- Active: enabled

Notes:
- Storage Limit and File-Size Limit are used by dynamic provider selection.
- Upload routing will only choose providers that satisfy both:
  - remaining storage >= file size
  - file-size limit >= file size

## 3) Authorize B2 CLI

From the b2-cli directory:

- Run: uv run b2 account authorize
- Enter application key ID and application key when prompted

## 4) Configure CORS For S3 Uploads

Use the bucket update command with --cors-rules (important).

Command pattern:

uv run b2 bucket update <bucket-name> allPrivate --cors-rules "[{\"corsRuleName\":\"s3-fix\",\"allowedOrigins\":[\"*\"],\"allowedHeaders\":[\"*\"],\"allowedOperations\":[\"s3_put\",\"s3_get\",\"s3_head\"],\"exposeHeaders\":[\"ETag\"],\"maxAgeSeconds\":3600}]"

Working example:

uv run b2 bucket update dot-storage allPrivate --cors-rules "[{\"corsRuleName\":\"s3-fix\",\"allowedOrigins\":[\"*\"],\"allowedHeaders\":[\"*\"],\"allowedOperations\":[\"s3_put\",\"s3_get\",\"s3_head\"],\"exposeHeaders\":[\"ETag\"],\"maxAgeSeconds\":3600}]"

Why this works:
- Passing raw JSON as a positional argument fails.
- You must pass JSON via the --cors-rules flag.

## 5) Verify Bucket Settings

Run:

uv run b2 bucket get dot-storage

Confirm:
- options contains s3
- corsRules contains your s3-fix rule
- allowedOperations includes s3_put, s3_get, s3_head

## 6) App-Level Verification

After adding provider in Admin:

- Confirm provider appears as Active
- Confirm storage and file-size limits display correctly
- Upload behavior should be:
  - oversized file for a provider is rejected for that provider
  - if one provider is near full, routing switches to the most available eligible provider

## 7) Troubleshooting

If you see unrecognized arguments with b2 bucket update:
- Use --cors-rules explicitly
- Keep JSON in one quoted string

If upload fails with signature/CORS errors:
- Recheck endpoint and region match the bucket
- Re-run bucket update with --cors-rules
- Verify browser requests are hitting the same endpoint as provider config

If files fail due to size:
- Check user file-size limit
- Check provider file-size limit
- Check provider remaining storage

## 8) Security Notes

- Never commit real keys to source control.
- If a key was exposed in chat, logs, or screenshots, rotate it immediately.
- Store secrets in environment variables or a secret manager.
