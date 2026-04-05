# Full S3 Compatibility Implementation Plan

This document is the implementation blueprint for making the platform comprehensively S3-compatible, including API surface, behavior compatibility, auth, policy model, versioning, UI, testing, and rollout.

## 1) Goals And Scope

### Primary goal
Build a standards-aligned S3 compatibility layer so AWS SDKs, CLI tools, and browser-based S3 workflows operate correctly against the platform.

### Must-have compatibility scope
- Object CRUD: PutObject, GetObject, DeleteObject, HeadObject, CopyObject
- Multipart uploads: CreateMultipartUpload, UploadPart, CompleteMultipartUpload, AbortMultipartUpload, ListParts, ListMultipartUploads
- Bucket CRUD and metadata: CreateBucket, DeleteBucket, ListBuckets, HeadBucket, GetBucketLocation
- Listing APIs: ListObjects, ListObjectsV2
- Authentication: SigV4 headers and query signing
- Browser compatibility: Bucket CORS APIs and behavior
- Access control: Bucket policy + basic ACL support for bucket and object
- Behavioral compatibility: Presigned GET/PUT semantics
- Expected compatibility: Versioning APIs and object version list behavior

### Strongly expected additions
- Object tagging APIs
- Basic SSE-S3 encryption metadata support
- Minimal metrics and audit logging

## 2) Architecture Strategy

### Existing platform model
The platform currently maps files/folders/providers to a virtualized storage abstraction and has a virtual bucket concept.

### Target model
Introduce a dedicated S3 gateway domain model while preserving compatibility with existing file/folder/provider tables.

- Keep existing file system abstractions for operational continuity.
- Add explicit S3-facing entities for bucket-level and object-level concerns that do not map cleanly to generic file records.
- Ensure all S3 mutations remain source-of-truth synchronized into platform state using TanStack Query and TanStack Store flows.

## 3) Database Schema Plan (Drizzle)

## 3.1 Bucket domain

### Table: virtual_bucket (extend)
Add columns:
- region: text default us-east-1
- versioning_state: text enum disabled|enabled|suspended default disabled
- object_ownership_mode: text default bucket-owner-preferred
- block_public_access: integer/boolean default true
- created_by_user_id: text nullable

Indexes:
- unique userId + bucket name (already expected)
- index on isActive

### Table: bucket_policy
- id
- bucket_id (FK virtual_bucket.id)
- policy_json (text)
- etag
- created_at
- updated_at

Constraints:
- one active policy per bucket

### Table: bucket_acl
- id
- bucket_id (FK)
- owner_canonical_id
- canned_acl (private|public-read)
- grants_json (minimal grants storage)
- updated_at

### Table: bucket_cors_rule
- id
- bucket_id (FK)
- rule_order
- allowed_origins_json
- allowed_methods_json
- allowed_headers_json
- expose_headers_json
- max_age_seconds

Indexes:
- bucket_id + rule_order

## 3.2 Object domain

### Table: object_acl
- id
- file_id (FK file.id)
- owner_canonical_id
- canned_acl (private|public-read)
- grants_json
- updated_at

### Table: file_tag
- id
- file_id (FK file.id)
- tag_key
- tag_value
- created_at
- updated_at

Constraints:
- unique file_id + tag_key

### Table: file_version
- id
- bucket_id (FK virtual_bucket.id)
- file_id (nullable FK file.id, for delete markers)
- object_key
- version_id
- is_delete_marker
- etag
- size_in_bytes
- content_type
- storage_provider_id
- upstream_object_key
- created_at
- created_by_user_id

Indexes:
- bucket_id + object_key + created_at desc
- unique bucket_id + object_key + version_id

## 3.3 Multipart domain

### Existing: upload_attempt (reuse + extend)
Add columns:
- upload_id (S3-compatible identifier, unique)
- initiated_by_user_id
- checksum_algorithm
- encryption_mode
- storage_class

### Table: multipart_upload_part
- id
- upload_attempt_id (FK upload_attempt.id)
- part_number
- etag
- size_in_bytes
- checksum_value
- upstream_part_locator
- created_at

Constraints:
- unique upload_attempt_id + part_number

Indexes:
- upload_attempt_id

## 3.4 Auth domain (SigV4)

### Table: api_key
- id
- user_id (FK auth user)
- access_key_id (unique)
- secret_key_hash
- secret_key_last4
- status (active|disabled|rotated)
- created_at
- expires_at nullable
- last_used_at nullable

Notes:
- Never store plaintext secret keys.
- Store hash only.
- Provide one-time secret reveal UX on creation.

## 3.5 Encryption and observability domain

### Table: object_encryption_metadata
- id
- file_id (FK)
- mode (SSE-S3)
- kms_key_id nullable
- encrypted_at

### Table: s3_request_audit
- id
- request_id
- user_id nullable
- access_key_id nullable
- bucket_name
- object_key nullable
- operation
- http_status
- error_code nullable
- duration_ms
- source_ip
- user_agent
- created_at

## 4) API and Route Design (Hono)

Create a dedicated S3 route module (for example under src/routes/api/s3).

### Request classification
- Path style support first: /{bucket}/{key...}
- Optional host style support later via host parsing
- Detect operation by method + query parameters + headers

### Response format
- XML for S3 operation responses and errors
- Correct content-type and status codes
- Strongly consistent ETag and Last-Modified headers on object reads

### Core bucket APIs
- PUT /{bucket} -> CreateBucket
- DELETE /{bucket} -> DeleteBucket
- GET / -> ListBuckets
- HEAD /{bucket} -> HeadBucket
- GET /{bucket}?location -> GetBucketLocation

### Core object APIs
- PUT /{bucket}/{key} -> PutObject
- GET /{bucket}/{key} -> GetObject
- DELETE /{bucket}/{key} -> DeleteObject
- HEAD /{bucket}/{key} -> HeadObject
- PUT /{bucket}/{key} with x-amz-copy-source -> CopyObject

### Listing APIs
- GET /{bucket}?list-type=2 -> ListObjectsV2
- GET /{bucket} without list-type -> ListObjects

Behavior details:
- Support prefix, delimiter, continuation-token, start-after, max-keys
- Return CommonPrefixes and IsTruncated correctly

### Multipart APIs
- POST /{bucket}/{key}?uploads -> CreateMultipartUpload
- PUT /{bucket}/{key}?partNumber=N&uploadId=... -> UploadPart
- POST /{bucket}/{key}?uploadId=... -> CompleteMultipartUpload
- DELETE /{bucket}/{key}?uploadId=... -> AbortMultipartUpload
- GET /{bucket}/{key}?uploadId=... -> ListParts
- GET /{bucket}?uploads -> ListMultipartUploads

### CORS APIs
- GET /{bucket}?cors -> GetBucketCors
- PUT /{bucket}?cors -> PutBucketCors
- DELETE /{bucket}?cors -> DeleteBucketCors

### Access control APIs
- GET /{bucket}?policy -> GetBucketPolicy
- PUT /{bucket}?policy -> PutBucketPolicy
- DELETE /{bucket}?policy -> DeleteBucketPolicy
- GET /{bucket}?acl -> GetBucketAcl
- PUT /{bucket}?acl -> PutBucketAcl
- GET /{bucket}/{key}?acl -> GetObjectAcl
- PUT /{bucket}/{key}?acl -> PutObjectAcl

### Versioning APIs
- GET /{bucket}?versioning -> GetBucketVersioning
- PUT /{bucket}?versioning -> PutBucketVersioning
- GET /{bucket}?versions -> ListObjectVersions

### Tagging APIs
- GET /{bucket}/{key}?tagging -> GetObjectTagging
- PUT /{bucket}/{key}?tagging -> PutObjectTagging
- DELETE /{bucket}/{key}?tagging -> DeleteObjectTagging

## 5) SigV4 Implementation Plan

## 5.1 Header-based signing
Implement canonical request creation with:
- method
- canonical URI
- canonical query
- canonical headers
- signed headers
- payload hash

Then verify:
- credential scope (date/region/service/aws4_request)
- derived signing key
- computed signature equals provided signature

## 5.2 Query-based signing (presigned)
Validate:
- X-Amz-Algorithm
- X-Amz-Credential
- X-Amz-Date
- X-Amz-Expires
- X-Amz-SignedHeaders
- X-Amz-Signature

Rules:
- reject expired signatures
- apply policy/ACL checks after identity resolution

## 5.3 Clock skew and error model
- allow bounded skew window (for example +/- 5 minutes)
- return AWS-style XML errors (RequestTimeTooSkewed, SignatureDoesNotMatch, AccessDenied)

## 6) Access Control Model

## 6.1 Evaluation order
1. Resolve caller identity from SigV4 or anonymous
2. Evaluate explicit deny from bucket policy
3. Evaluate explicit allow from bucket policy
4. Evaluate ACL fallback
5. Default deny

## 6.2 Initial policy subset
Support minimal IAM-like subset:
- Principal: * and explicit key identities
- Action: s3:GetObject, s3:PutObject, s3:DeleteObject, s3:ListBucket
- Resource: bucket ARN and object ARN prefix
- Effect: Allow/Deny

## 6.3 Basic ACL subset
Support canned ACLs:
- private
- public-read

Bucket ACL and object ACL endpoints should round-trip valid XML and enforce expected read behavior.

## 7) Versioning Behavior

### States
- Disabled
- Enabled
- Suspended

### Object write behavior
- Enabled: each PUT creates a new version_id
- Suspended: null version rules apply
- Delete with enabled: create delete marker

### Read behavior
- Default GET returns latest non-delete-marker visible result
- versionId query returns exact version

### Listing behavior
- ListObjectVersions returns versions + delete markers ordered by key then reverse last modified where required

## 8) CORS Behavior

Implement bucket-level CORS rule persistence and evaluation for:
- OPTIONS preflight
- PUT/GET with origin and headers

Return headers conditionally:
- Access-Control-Allow-Origin
- Access-Control-Allow-Methods
- Access-Control-Allow-Headers
- Access-Control-Expose-Headers
- Access-Control-Max-Age

Presigned URL browser uploads must pass CORS preflight when configured.

## 9) UI Implementation Plan (Theme-Aligned)

## 9.1 Bucket operations UI
Create a bucket settings modal with tabbed interface:
- Overview tab: name, region, ownership, public access block
- Permissions tab: bucket policy editor + ACL selector
- CORS tab: rule editor table and JSON preview
- Versioning tab: enabled/suspended toggles and explanatory warnings

Behavior:
- useQuery for reads
- useMutation for updates with optimistic updates
- rollback and visible error toasts on failure

## 9.2 Object operations UI
Create an object operations modal with tabs:
- Properties tab: etag, size, content-type, metadata
- Tags tab: key/value tagging editor
- Versions tab: timeline list with restore action
- Permissions tab: object ACL controls

## 9.3 State synchronization
- Keep TanStack Store as local interaction model
- Use TanStack Query cache invalidations per bucket/object scope
- Keep server as source of truth with optimistic UI conflict handling

## 10) Migration Plan

## 10.1 Migration sequencing
1. Add new tables and nullable columns first
2. Backfill defaults for existing buckets/objects
3. Add required indexes
4. Enable gateway code paths behind feature flag
5. Run compatibility smoke tests

## 10.2 Backfill strategy
- Existing buckets receive region us-east-1, versioning disabled
- Existing objects get inferred ACL private
- Existing object history starts with implicit null-version baseline

## 10.3 Rollback strategy
- Keep read paths backward compatible
- Feature-flag new APIs
- Maintain idempotent migration scripts

## 11) Testing and Certification Matrix

## 11.1 SDK validation
- AWS SDK JS v3
- AWS CLI s3api commands
- boto3 basic scenarios

## 11.2 Functional coverage checklist
- Bucket APIs: create/list/head/delete/location
- Object APIs: put/get/head/copy/delete
- Multipart APIs all six operations
- CORS APIs all three operations
- ACL APIs bucket and object
- Policy APIs get/put/delete
- Versioning APIs get/put/list versions
- Tagging APIs get/put/delete
- Presigned GET/PUT end-to-end in browser

## 11.3 Error compatibility
Validate key XML error responses:
- NoSuchBucket
- NoSuchKey
- AccessDenied
- InvalidRequest
- SignatureDoesNotMatch
- NoSuchUpload
- BucketAlreadyExists or bucket ownership equivalent behavior

## 12) Performance and Reliability

- Stream object reads/writes without full buffering
- Multipart part limits and validation
- Cleanup worker for abandoned multipart uploads
- Retry-safe idempotency for complete/abort operations
- Concurrency guards for version creation and part ordering

## 13) Security Hardening

- Secret key hashing and one-time display
- Access key rotation support
- Rate limiting on auth failures
- Request audit logs for incident response
- Strict XML parser configuration to avoid XXE-style risks

## 14) Implementation Phases And Deliverables

### Phase A: Foundations
- Schema migrations
- SigV4 middleware
- XML error and response helpers

### Phase B: Core compatibility
- Bucket APIs
- Object APIs
- ListObjects/ListObjectsV2
- Multipart APIs

### Phase C: Controls and browser readiness
- CORS APIs + enforcement
- Bucket policy + ACL API and evaluator
- Presigned URL verification

### Phase D: Extended parity
- Versioning APIs and behaviors
- Object tagging APIs
- Basic SSE-S3 metadata support
- Request audit metrics

### Phase E: UX and polish
- Bucket modal with tabbed controls
- Object modal with tag/version/permission tabs
- Optimistic updates and error-state handling

## 15) Definition Of Done

The implementation is complete when all are true:
- Required core S3 APIs pass integration tests via AWS CLI and one SDK
- SigV4 header and presigned signatures validate correctly
- Bucket CORS config persists and browser upload flows work
- Policy + ACL enforcement blocks/allows as expected
- Versioning behavior matches expected null-version/delete-marker semantics
- UI exposes bucket/object operations through tabbed modals with optimistic updates
- Audit logs capture operation-level outcomes

## 16) Immediate Next Work Items

1. Add Drizzle schema files for bucket policy, ACL, CORS, versions, tags, multipart parts, api keys, and audit logs.
2. Generate and review migrations.
3. Implement SigV4 middleware and XML helpers.
4. Implement Bucket and Object core APIs first, then multipart APIs.
5. Ship bucket modal tabs (Overview, Permissions, CORS, Versioning) and object modal tabs (Properties, Tags, Versions, Permissions).
6. Run CLI and SDK compatibility suite and fix behavior deltas.
