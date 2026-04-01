# S3 Compatibility Playwright Suite

This suite validates S3 compatibility endpoints against the hosted gateway at `https://storage.wpsadi.dev` using Playwright + AWS SDK.

## Covered operations

- ListBuckets
- HeadBucket
- PutObject
- HeadObject
- GetObject
- ListObjectsV2
- DeleteObject
- Multipart flow (CreateMultipartUpload, UploadPart, CompleteMultipartUpload, AbortMultipartUpload)

## Local execution

Set environment variables:

- `S3_TEST_ENDPOINT` (default: `https://storage.wpsadi.dev`)
- `S3_TEST_REGION` (default: `auto`)
- `S3_TEST_BUCKET` (required)
- `S3_TEST_ACCESS_KEY_ID` (required)
- `S3_TEST_SECRET_ACCESS_KEY` (required)
- `S3_TEST_ENABLE_MULTIPART` (`true` to enable multipart test)
- `S3_TEST_SD_COMPARTMENT_PREFIX` (optional, default: `sd`)
- `S3_TEST_DUMMY_FILE_PATH` (optional, default: `tests/s3/fixtures/dummy-upload.txt`)

Run:

```bash
pnpm test:s3:compat
```

Use your own dummy file:

```bash
S3_TEST_DUMMY_FILE_PATH=path/to/your-dummy-file.bin pnpm test:s3:compat
```

## CI workflow

Workflow file: `.github/workflows/s3-compat-playwright.yml`

Required GitHub secrets:

- `S3_TEST_REGION`
- `S3_TEST_BUCKET`
- `S3_TEST_ACCESS_KEY_ID`
- `S3_TEST_SECRET_ACCESS_KEY`

Compartment coverage:

- The suite includes a dedicated SD compartment prefix test using `S3_TEST_SD_COMPARTMENT_PREFIX`.
