import { integer, index, text, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'
import { schema } from './schema'
import { user } from './auth-schema'
import { folder } from './storage'
import { storageProvider } from './storage-provider'

export const virtualBucket = schema.table(
  'virtual_bucket',
  {
    id: text( 'id' )
      .$defaultFn( () => crypto.randomUUID() )
      .primaryKey(),
    userId: text( 'user_id' )
      .notNull()
      .references( () => user.id, { onDelete: 'cascade' } ),
    name: text( 'name' ).notNull(),
    region: text( 'region' ).default( 'auto' ).notNull(),
    versioningState: text( 'versioning_state' ).default( 'disabled' ).notNull(),
    objectOwnershipMode: text( 'object_ownership_mode' )
      .default( 'bucket-owner-preferred' )
      .notNull(),
    blockPublicAccess: integer( 'block_public_access', { mode: 'boolean' } )
      .default( true )
      .notNull(),
    mappedFolderId: text( 'mapped_folder_id' ).references( () => folder.id, {
      onDelete: 'set null',
    } ),
    createdByUserId: text( 'created_by_user_id' ).references( () => user.id, {
      onDelete: 'set null',
    } ),
    isActive: integer( 'is_active', { mode: 'boolean' } ).default( true ).notNull(),
    createdAt: integer( 'created_at', { mode: 'timestamp' } )
      .$defaultFn( () => new Date() )
      .notNull(),
    updatedAt: integer( 'updated_at', { mode: 'timestamp' } )
      .$defaultFn( () => new Date() )
      .$onUpdate( () => /* @__PURE__ */ new Date() )
      .notNull(),
    credentialVersion: integer( 'credential_version' ).default( 1 ).notNull(),
  },
  ( table ) => [
    uniqueIndex( 'virtualBucket_userId_name_unq' ).on( table.userId, table.name ),
    index( 'virtualBucket_userId_idx' ).on( table.userId ),
    index( 'virtualBucket_mappedFolderId_idx' ).on( table.mappedFolderId ),
    index( 'virtualBucket_isActive_idx' ).on( table.isActive ),
  ],
)

export const uploadAttempt = schema.table(
  'upload_attempt',
  {
    id: text( 'id' )
      .$defaultFn( () => crypto.randomUUID() )
      .primaryKey(),
    userId: text( 'user_id' )
      .notNull()
      .references( () => user.id, { onDelete: 'cascade' } ),
    bucketId: text( 'bucket_id' )
      .notNull()
      .references( () => virtualBucket.id, { onDelete: 'cascade' } ),
    providerId: text( 'provider_id' ).references( () => storageProvider.id, {
      onDelete: 'set null',
    } ),
    objectKey: text( 'object_key' ).notNull(),
    upstreamObjectKey: text( 'upstream_object_key' ).notNull(),
    uploadId: text( 'upload_id' ),
    initiatedByUserId: text( 'initiated_by_user_id' ).references( () => user.id, {
      onDelete: 'set null',
    } ),
    checksumAlgorithm: text( 'checksum_algorithm' ),
    encryptionMode: text( 'encryption_mode' ),
    storageClass: text( 'storage_class' ),
    expectedSize: integer( 'expected_size', { mode: 'number' } ).notNull(),
    contentType: text( 'content_type' ),
    etag: text( 'etag' ),
    status: text( 'status' ).default( 'pending' ).notNull(),
    errorMessage: text( 'error_message' ),
    expiresAt: integer( 'expires_at', { mode: 'timestamp' } ).notNull(),
    completedAt: integer( 'completed_at', { mode: 'timestamp' } ),
    createdAt: integer( 'created_at', { mode: 'timestamp' } )
      .$defaultFn( () => new Date() )
      .notNull(),
    updatedAt: integer( 'updated_at', { mode: 'timestamp' } )
      .$defaultFn( () => new Date() )
      .$onUpdate( () => /* @__PURE__ */ new Date() )
      .notNull(),
  },
  ( table ) => [
    index( 'uploadAttempt_userId_idx' ).on( table.userId ),
    index( 'uploadAttempt_bucketId_idx' ).on( table.bucketId ),
    index( 'uploadAttempt_status_idx' ).on( table.status ),
    index( 'uploadAttempt_providerId_idx' ).on( table.providerId ),
    uniqueIndex( 'uploadAttempt_uploadId_unq' ).on( table.uploadId ),
  ],
)

export const multipartUploadPart = schema.table(
  'multipart_upload_part',
  {
    id: text( 'id' )
      .$defaultFn( () => crypto.randomUUID() )
      .primaryKey(),
    uploadAttemptId: text( 'upload_attempt_id' )
      .notNull()
      .references( () => uploadAttempt.id, { onDelete: 'cascade' } ),
    partNumber: integer( 'part_number' ).notNull(),
    etag: text( 'etag' ),
    sizeInBytes: integer( 'size_in_bytes', { mode: 'number' } )
      .notNull()
      .default( 0 ),
    checksumValue: text( 'checksum_value' ),
    upstreamPartLocator: text( 'upstream_part_locator' ),
    createdAt: integer( 'created_at', { mode: 'timestamp' } )
      .$defaultFn( () => new Date() )
      .notNull(),
  },
  ( table ) => [
    uniqueIndex( 'multipartUploadPart_uploadAttempt_partNumber_unq' ).on(
      table.uploadAttemptId,
      table.partNumber,
    ),
    index( 'multipartUploadPart_uploadAttempt_idx' ).on( table.uploadAttemptId ),
  ],
)

export const virtualBucketRelations = relations(
  virtualBucket,
  ( { one, many } ) => ( {
    owner: one( user, {
      fields: [virtualBucket.userId],
      references: [user.id],
    } ),
    mappedFolder: one( folder, {
      fields: [virtualBucket.mappedFolderId],
      references: [folder.id],
    } ),
    uploads: many( uploadAttempt ),
  } ),
)

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

export const multipartUploadPartRelations = relations(
  multipartUploadPart,
  ( { one } ) => ( {
    uploadAttempt: one( uploadAttempt, {
      fields: [multipartUploadPart.uploadAttemptId],
      references: [uploadAttempt.id],
    } ),
  } ),
)
