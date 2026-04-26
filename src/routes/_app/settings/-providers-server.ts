import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getAuthenticatedUser } from '@/lib/server-auth'
import { db } from '@/db'
import { storageProvider } from '@/db/schema/storage-provider'
import { file } from '@/db/schema/storage'
import { user as userTable } from '@/db/schema/auth-schema'
import { eq, and, ne, count } from 'drizzle-orm'
import { encryptProviderSecret } from '@/lib/provider-crypto'
import { listUserProvidersWithUsage } from '@/lib/storage-provider-queries'

const ProviderIdSchema = z.object( {
  providerId: z.string().min( 1 ),
} )

const SaveUserProviderSchema = z.object( {
  providerId: z.string().min( 1 ).optional(),
  name: z.string().min( 2 ).max( 120 ),
  endpoint: z.string().default( '' ),
  region: z.string().default( '' ),
  bucketName: z.string().default( '' ),
  accessKeyId: z.string().default( '' ),
  secretAccessKey: z.string().default( '' ),
  storageLimitBytes: z.number().int().positive(),
  fileSizeLimitBytes: z.number().int().positive(),
  proxyUploadsEnabled: z.boolean().default( false ),
  isActive: z.boolean().default( true ),
} )

export const getUserProvidersFn = createServerFn( { method: 'GET' } ).handler(
  async () => {
    const authUser = await getAuthenticatedUser()
    return await listUserProvidersWithUsage( authUser.id )
  },
)

export const saveUserProviderFn = createServerFn( { method: 'POST' } )
  .inputValidator( SaveUserProviderSchema )
  .handler( async ( { data } ) => {
    const authUser = await getAuthenticatedUser()
    if ( data.fileSizeLimitBytes > data.storageLimitBytes ) {
      throw new Error( 'File-size limit cannot exceed storage limit' )
    }

    const trimmedName = data.name.trim()
    if ( !trimmedName ) {
      throw new Error( 'Provider name is required' )
    }

    const endpoint = data.endpoint.trim()
    const region = data.region.trim()
    const bucketName = data.bucketName.trim()
    const accessKeyId = data.accessKeyId.trim()
    const secretAccessKey = data.secretAccessKey.trim()

    if ( data.providerId ) {
      // Update existing provider owned by user
      const existingRows = await db
        .select()
        .from( storageProvider )
        .where(
          and(
            eq( storageProvider.id, data.providerId ),
            eq( storageProvider.userId, authUser.id ),
          ),
        )
        .limit( 1 )

      if ( existingRows.length === 0 ) {
        throw new Error( 'Storage provider not found or unauthorized' )
      }

      const existing = existingRows[0]
      const nextEndpoint = endpoint || existing.endpoint
      const nextRegion = region || existing.region
      const nextBucketName = bucketName || existing.bucketName
      const nextAccessKeyEncrypted = accessKeyId
        ? encryptProviderSecret( accessKeyId )
        : existing.accessKeyIdEncrypted
      const nextSecretKeyEncrypted = secretAccessKey
        ? encryptProviderSecret( secretAccessKey )
        : existing.secretAccessKeyEncrypted

      // Check for duplicate name among user's other providers
      const duplicate = await db
        .select()
        .from( storageProvider )
        .where(
          and(
            eq( storageProvider.userId, authUser.id ),
            eq( storageProvider.name, trimmedName ),
            ne( storageProvider.id, data.providerId ),
          ),
        )
        .limit( 1 )

      if ( duplicate.length > 0 ) {
        throw new Error( 'Provider name already exists for your account' )
      }

      const updated = await db
        .update( storageProvider )
        .set( {
          name: trimmedName,
          endpoint: nextEndpoint,
          region: nextRegion,
          bucketName: nextBucketName,
          accessKeyIdEncrypted: nextAccessKeyEncrypted,
          secretAccessKeyEncrypted: nextSecretKeyEncrypted,
          storageLimitBytes: data.storageLimitBytes,
          fileSizeLimitBytes: data.fileSizeLimitBytes,
          proxyUploadsEnabled: data.proxyUploadsEnabled,
          isActive: data.isActive,
        } )
        .where( eq( storageProvider.id, data.providerId ) )
        .returning( {
          id: storageProvider.id,
          name: storageProvider.name,
        } )

      if ( updated.length === 0 ) {
        throw new Error( 'Failed to update provider' )
      }

      return { success: true, provider: updated[0], operation: 'updated' }
    }

    if (
      !endpoint ||
      !region ||
      !bucketName ||
      !accessKeyId ||
      !secretAccessKey
    ) {
      throw new Error(
        'Endpoint, region, bucket name, access key, and secret key are required when creating a provider',
      )
    }

    const encryptedAccessKey = encryptProviderSecret( accessKeyId )
    const encryptedSecret = encryptProviderSecret( secretAccessKey )

    // Create new provider for user
    const duplicate = await db
      .select()
      .from( storageProvider )
      .where(
        and(
          eq( storageProvider.userId, authUser.id ),
          eq( storageProvider.name, trimmedName ),
        ),
      )
      .limit( 1 )

    if ( duplicate.length > 0 ) {
      throw new Error( 'Provider name already exists for your account' )
    }

    const inserted = await db
      .insert( storageProvider )
      .values( {
        id: crypto.randomUUID(),
        userId: authUser.id,
        name: trimmedName,
        endpoint,
        region,
        bucketName,
        accessKeyIdEncrypted: encryptedAccessKey,
        secretAccessKeyEncrypted: encryptedSecret,
        storageLimitBytes: data.storageLimitBytes,
        fileSizeLimitBytes: data.fileSizeLimitBytes,
        proxyUploadsEnabled: data.proxyUploadsEnabled,
        isActive: data.isActive,
      } )
      .returning( {
        id: storageProvider.id,
        name: storageProvider.name,
      } )

    if ( inserted.length === 0 ) {
      throw new Error( 'Failed to create provider' )
    }

    return { success: true, provider: inserted[0], operation: 'created' }
  } )

export const deleteUserProviderFn = createServerFn( { method: 'POST' } )
  .inputValidator( ProviderIdSchema )
  .handler( async ( { data } ) => {
    const authUser = await getAuthenticatedUser()

    const providerRows = await db
      .select()
      .from( storageProvider )
      .where(
        and(
          eq( storageProvider.id, data.providerId ),
          eq( storageProvider.userId, authUser.id ),
        ),
      )
      .limit( 1 )

    if ( providerRows.length === 0 ) {
      throw new Error( 'Provider not found' )
    }

    // Check if any non-deleted files use this provider
    const [fileCountRow] = await db
      .select( { count: count() } )
      .from( file )
      .where(
        and( eq( file.providerId, data.providerId ), eq( file.isDeleted, false ) ),
      )

    if ( fileCountRow.count > 0 ) {
      throw new Error( 'Cannot delete provider while files are stored in it' )
    }

    await db
      .delete( storageProvider )
      .where( eq( storageProvider.id, data.providerId ) )

    return { success: true }
  } )

export const toggleUserProviderActiveFn = createServerFn( { method: 'POST' } )
  .inputValidator(
    z.object( {
      providerId: z.string().min( 1 ),
      isActive: z.boolean(),
    } ),
  )
  .handler( async ( { data } ) => {
    const authUser = await getAuthenticatedUser()

    const updated = await db
      .update( storageProvider )
      .set( { isActive: data.isActive } )
      .where(
        and(
          eq( storageProvider.id, data.providerId ),
          eq( storageProvider.userId, authUser.id ),
        ),
      )
      .returning( { id: storageProvider.id, isActive: storageProvider.isActive } )

    if ( updated.length === 0 ) {
      throw new Error( 'Provider not found' )
    }

    return { success: true, provider: updated[0] }
  } )

export const updateProviderPreferenceFn = createServerFn( { method: 'POST' } )
  .inputValidator( z.object( { use_system_providers: z.boolean() } ) )
  .handler( async ( { data } ) => {
    const authUser = await getAuthenticatedUser()

    await db
      .update( userTable )
      .set( { use_system_providers: data.use_system_providers } )
      .where( eq( userTable.id, authUser.id ) )

    return { success: true }
  } )
