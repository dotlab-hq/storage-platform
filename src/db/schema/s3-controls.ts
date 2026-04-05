import { index, integer, text, uniqueIndex } from "drizzle-orm/sqlite-core"
import { schema } from "./schema"
import { virtualBucket } from "./s3-gateway"
import { file } from "./storage"
import { storageProvider } from "./storage-provider"
import { user } from "./auth-schema"

export const bucketPolicy = schema.table(
    "bucket_policy",
    {
        id: text( "id" ).$defaultFn( () => crypto.randomUUID() ).primaryKey(),
        bucketId: text( "bucket_id" ).notNull().references( () => virtualBucket.id, { onDelete: "cascade" } ),
        policyJson: text( "policy_json" ).notNull(),
        etag: text( "etag" ),
        createdAt: integer( "created_at", { mode: "timestamp" } ).$defaultFn( () => new Date() ).notNull(),
        updatedAt: integer( "updated_at", { mode: "timestamp" } )
            .$defaultFn( () => new Date() )
            .$onUpdate( () => new Date() )
            .notNull(),
    },
    ( table ) => [uniqueIndex( "bucketPolicy_bucket_unq" ).on( table.bucketId )],
)

export const bucketAcl = schema.table(
    "bucket_acl",
    {
        id: text( "id" ).$defaultFn( () => crypto.randomUUID() ).primaryKey(),
        bucketId: text( "bucket_id" ).notNull().references( () => virtualBucket.id, { onDelete: "cascade" } ),
        ownerCanonicalId: text( "owner_canonical_id" ).notNull(),
        cannedAcl: text( "canned_acl" ).notNull().default( "private" ),
        grantsJson: text( "grants_json" ),
        updatedAt: integer( "updated_at", { mode: "timestamp" } )
            .$defaultFn( () => new Date() )
            .$onUpdate( () => new Date() )
            .notNull(),
    },
    ( table ) => [uniqueIndex( "bucketAcl_bucket_unq" ).on( table.bucketId )],
)

export const bucketCorsRule = schema.table(
    "bucket_cors_rule",
    {
        id: text( "id" ).$defaultFn( () => crypto.randomUUID() ).primaryKey(),
        bucketId: text( "bucket_id" ).notNull().references( () => virtualBucket.id, { onDelete: "cascade" } ),
        ruleOrder: integer( "rule_order" ).notNull(),
        allowedOriginsJson: text( "allowed_origins_json" ).notNull(),
        allowedMethodsJson: text( "allowed_methods_json" ).notNull(),
        allowedHeadersJson: text( "allowed_headers_json" ),
        exposeHeadersJson: text( "expose_headers_json" ),
        maxAgeSeconds: integer( "max_age_seconds" ),
    },
    ( table ) => [
        uniqueIndex( "bucketCorsRule_bucket_order_unq" ).on( table.bucketId, table.ruleOrder ),
        index( "bucketCorsRule_bucket_idx" ).on( table.bucketId ),
    ],
)

export const objectAcl = schema.table(
    "object_acl",
    {
        id: text( "id" ).$defaultFn( () => crypto.randomUUID() ).primaryKey(),
        fileId: text( "file_id" ).notNull().references( () => file.id, { onDelete: "cascade" } ),
        ownerCanonicalId: text( "owner_canonical_id" ).notNull(),
        cannedAcl: text( "canned_acl" ).notNull().default( "private" ),
        grantsJson: text( "grants_json" ),
        updatedAt: integer( "updated_at", { mode: "timestamp" } )
            .$defaultFn( () => new Date() )
            .$onUpdate( () => new Date() )
            .notNull(),
    },
    ( table ) => [uniqueIndex( "objectAcl_file_unq" ).on( table.fileId )],
)

export const fileTag = schema.table(
    "file_tag",
    {
        id: text( "id" ).$defaultFn( () => crypto.randomUUID() ).primaryKey(),
        fileId: text( "file_id" ).notNull().references( () => file.id, { onDelete: "cascade" } ),
        tagKey: text( "tag_key" ).notNull(),
        tagValue: text( "tag_value" ).notNull(),
        createdAt: integer( "created_at", { mode: "timestamp" } ).$defaultFn( () => new Date() ).notNull(),
        updatedAt: integer( "updated_at", { mode: "timestamp" } )
            .$defaultFn( () => new Date() )
            .$onUpdate( () => new Date() )
            .notNull(),
    },
    ( table ) => [
        uniqueIndex( "fileTag_file_tagKey_unq" ).on( table.fileId, table.tagKey ),
        index( "fileTag_file_idx" ).on( table.fileId ),
    ],
)

export const fileVersion = schema.table(
    "file_version",
    {
        id: text( "id" ).$defaultFn( () => crypto.randomUUID() ).primaryKey(),
        bucketId: text( "bucket_id" ).notNull().references( () => virtualBucket.id, { onDelete: "cascade" } ),
        fileId: text( "file_id" ).references( () => file.id, { onDelete: "set null" } ),
        objectKey: text( "object_key" ).notNull(),
        versionId: text( "version_id" ).notNull(),
        isDeleteMarker: integer( "is_delete_marker", { mode: "boolean" } ).default( false ).notNull(),
        etag: text( "etag" ),
        sizeInBytes: integer( "size_in_bytes", { mode: "number" } ).notNull().default( 0 ),
        contentType: text( "content_type" ),
        storageProviderId: text( "storage_provider_id" ).references( () => storageProvider.id, { onDelete: "set null" } ),
        upstreamObjectKey: text( "upstream_object_key" ),
        createdAt: integer( "created_at", { mode: "timestamp" } ).$defaultFn( () => new Date() ).notNull(),
        createdByUserId: text( "created_by_user_id" ).references( () => user.id, { onDelete: "set null" } ),
    },
    ( table ) => [
        uniqueIndex( "fileVersion_bucket_key_version_unq" ).on( table.bucketId, table.objectKey, table.versionId ),
        index( "fileVersion_bucket_key_created_idx" ).on( table.bucketId, table.objectKey, table.createdAt ),
    ],
)
