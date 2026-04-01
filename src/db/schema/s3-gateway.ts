import { bigint, boolean, index, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { schema } from "./schema"
import { user } from "./auth-schema"
import { folder } from "./storage"
import { storageProvider } from "./storage-provider"

export const virtualBucket = schema.table(
    "virtual_bucket",
    {
        id: text( "id" )
            .$defaultFn( () => crypto.randomUUID() )
            .primaryKey(),
        userId: text( "user_id" )
            .notNull()
            .references( () => user.id, { onDelete: "cascade" } ),
        name: text( "name" ).notNull(),
        mappedFolderId: text( "mapped_folder_id" ).references( () => folder.id, {
            onDelete: "set null",
        } ),
        isActive: boolean( "is_active" ).default( true ).notNull(),
        createdAt: timestamp( "created_at" ).defaultNow().notNull(),
        updatedAt: timestamp( "updated_at" )
            .defaultNow()
            .$onUpdate( () => /* @__PURE__ */ new Date() )
            .notNull(),
    },
    ( table ) => [
        uniqueIndex( "virtualBucket_userId_name_unq" ).on( table.userId, table.name ),
        index( "virtualBucket_userId_idx" ).on( table.userId ),
        index( "virtualBucket_mappedFolderId_idx" ).on( table.mappedFolderId ),
    ],
)

export const uploadAttempt = schema.table(
    "upload_attempt",
    {
        id: text( "id" )
            .$defaultFn( () => crypto.randomUUID() )
            .primaryKey(),
        userId: text( "user_id" )
            .notNull()
            .references( () => user.id, { onDelete: "cascade" } ),
        bucketId: text( "bucket_id" )
            .notNull()
            .references( () => virtualBucket.id, { onDelete: "cascade" } ),
        providerId: text( "provider_id" ).references( () => storageProvider.id, {
            onDelete: "set null",
        } ),
        objectKey: text( "object_key" ).notNull(),
        upstreamObjectKey: text( "upstream_object_key" ).notNull(),
        expectedSize: bigint( "expected_size", { mode: "number" } ).notNull(),
        contentType: text( "content_type" ),
        etag: text( "etag" ),
        status: text( "status" ).default( "pending" ).notNull(),
        errorMessage: text( "error_message" ),
        expiresAt: timestamp( "expires_at" ).notNull(),
        completedAt: timestamp( "completed_at" ),
        createdAt: timestamp( "created_at" ).defaultNow().notNull(),
        updatedAt: timestamp( "updated_at" )
            .defaultNow()
            .$onUpdate( () => /* @__PURE__ */ new Date() )
            .notNull(),
    },
    ( table ) => [
        index( "uploadAttempt_userId_idx" ).on( table.userId ),
        index( "uploadAttempt_bucketId_idx" ).on( table.bucketId ),
        index( "uploadAttempt_status_idx" ).on( table.status ),
        index( "uploadAttempt_providerId_idx" ).on( table.providerId ),
    ],
)

export const virtualBucketRelations = relations( virtualBucket, ( { one, many } ) => ( {
    owner: one( user, {
        fields: [virtualBucket.userId],
        references: [user.id],
    } ),
    mappedFolder: one( folder, {
        fields: [virtualBucket.mappedFolderId],
        references: [folder.id],
    } ),
    uploads: many( uploadAttempt ),
} ) )

export const uploadAttemptRelations = relations( uploadAttempt, ( { one } ) => ( {
    owner: one( user, {
        fields: [uploadAttempt.userId],
        references: [user.id],
    } ),
    bucket: one( virtualBucket, {
        fields: [uploadAttempt.bucketId],
        references: [virtualBucket.id],
    } ),
    provider: one( storageProvider, {
        fields: [uploadAttempt.providerId],
        references: [storageProvider.id],
    } ),
} ) )
