import { index, integer, text, uniqueIndex } from "drizzle-orm/sqlite-core"
import { schema } from "./schema"
import { file } from "./storage"
import { user } from "./auth-schema"

export const apiKey = schema.table(
    "api_key",
    {
        id: text( "id" ).$defaultFn( () => crypto.randomUUID() ).primaryKey(),
        userId: text( "user_id" ).notNull().references( () => user.id, { onDelete: "cascade" } ),
        accessKeyId: text( "access_key_id" ).notNull(),
        secretKeyHash: text( "secret_key_hash" ).notNull(),
        secretKeyLast4: text( "secret_key_last4" ).notNull(),
        status: text( "status" ).notNull().default( "active" ),
        createdAt: integer( "created_at", { mode: "timestamp" } ).$defaultFn( () => new Date() ).notNull(),
        expiresAt: integer( "expires_at", { mode: "timestamp" } ),
        lastUsedAt: integer( "last_used_at", { mode: "timestamp" } ),
    },
    ( table ) => [
        uniqueIndex( "apiKey_accessKeyId_unq" ).on( table.accessKeyId ),
        index( "apiKey_userId_idx" ).on( table.userId ),
    ],
)

export const objectEncryptionMetadata = schema.table(
    "object_encryption_metadata",
    {
        id: text( "id" ).$defaultFn( () => crypto.randomUUID() ).primaryKey(),
        fileId: text( "file_id" ).notNull().references( () => file.id, { onDelete: "cascade" } ),
        mode: text( "mode" ).notNull().default( "SSE-S3" ),
        kmsKeyId: text( "kms_key_id" ),
        encryptedAt: integer( "encrypted_at", { mode: "timestamp" } ).$defaultFn( () => new Date() ).notNull(),
    },
    ( table ) => [uniqueIndex( "objectEncryptionMetadata_file_unq" ).on( table.fileId )],
)

export const s3RequestAudit = schema.table(
    "s3_request_audit",
    {
        id: text( "id" ).$defaultFn( () => crypto.randomUUID() ).primaryKey(),
        requestId: text( "request_id" ).notNull(),
        userId: text( "user_id" ).references( () => user.id, { onDelete: "set null" } ),
        accessKeyId: text( "access_key_id" ),
        bucketName: text( "bucket_name" ).notNull(),
        objectKey: text( "object_key" ),
        operation: text( "operation" ).notNull(),
        httpStatus: integer( "http_status" ).notNull(),
        errorCode: text( "error_code" ),
        durationMs: integer( "duration_ms" ).notNull(),
        sourceIp: text( "source_ip" ),
        userAgent: text( "user_agent" ),
        createdAt: integer( "created_at", { mode: "timestamp" } ).$defaultFn( () => new Date() ).notNull(),
    },
    ( table ) => [
        index( "s3RequestAudit_bucket_idx" ).on( table.bucketName ),
        index( "s3RequestAudit_createdAt_idx" ).on( table.createdAt ),
    ],
)
