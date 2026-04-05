import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'


import { getAuthenticatedUser } from '@/lib/server-auth'
import { db } from '@/db'
import { file as storageFile } from '@/db/schema/storage'
import { storageProvider } from '@/db/schema/storage-provider'
import { getProviderClientById } from '@/lib/s3-provider-client'

const GetPresignedUrlSchema = z.object( {
    fileId: z.string().min( 1 ),
} )

export const getFilePresignedUrlFn = createServerFn( { method: 'GET' } )
    .inputValidator( GetPresignedUrlSchema )
    .handler( async ( { data } ) => {
        const user = await getAuthenticatedUser()
        const { fileId } = data
        const userId = user.id

        const fileRows = await db
            .select( {
                id: storageFile.id,
                name: storageFile.name,
                mimeType: storageFile.mimeType,
                objectKey: storageFile.objectKey,
                providerId: storageFile.providerId,
                bucketName: storageProvider.bucketName,
            } )
            .from( storageFile )
            .leftJoin(
                storageProvider,
                eq( storageFile.providerId, storageProvider.id ),
            )
            .where( and( eq( storageFile.id, fileId ), eq( storageFile.userId, userId ) ) )
            .limit( 1 )

        if ( fileRows.length === 0 ) {
            throw new Error( 'File not found' )
        }

        const fileData = fileRows[0]

        if ( !fileData.providerId ) {
            throw new Error( 'File has no associated storage provider' )
        }
        if ( !fileData.bucketName ) {
            throw new Error( 'Storage provider missing bucket name' )
        }

        const { client } = await getProviderClientById(
            fileData.providerId,
        )
        const objectKey = fileData.objectKey
        const url = await getSignedUrl( client, new GetObjectCommand( {
            Bucket: fileData.bucketName,
            Key: objectKey,
            ResponseContentDisposition: `inline; filename="${fileData.name}"`,
        } ), { expiresIn: 3600 } )

        return { url }
    } )

export const getOwnedFileRedirectUrlFn = createServerFn( { method: 'GET' } )
    .inputValidator( GetPresignedUrlSchema )
    .handler( async ( { data } ) => {
        const user = await getAuthenticatedUser()
        const { fileId } = data
        const userId = user.id

        const fileRows = await db
            .select( {
                id: storageFile.id,
                name: storageFile.name,
                mimeType: storageFile.mimeType,
                objectKey: storageFile.objectKey,
                providerId: storageFile.providerId,
                bucketName: storageProvider.bucketName,
            } )
            .from( storageFile )
            .leftJoin(
                storageProvider,
                eq( storageFile.providerId, storageProvider.id ),
            )
            .where(
                and(
                    eq( storageFile.id, fileId ),
                    eq( storageFile.userId, userId ),
                    eq( storageFile.isDeleted, false ),
                ),
            )
            .limit( 1 )

        if ( fileRows.length === 0 ) {
            throw new Error( 'File not found or access denied' )
        }

        const fileData = fileRows[0]

        if ( !fileData.providerId || !fileData.bucketName ) {
            throw new Error( 'File configuration invalid' )
        }

        const { client } = await getProviderClientById(
            fileData.providerId,
        )


        const objectKey = fileData.objectKey
        const viewUrl = await getSignedUrl( client, new GetObjectCommand( {
            Bucket: fileData.bucketName,
            Key: objectKey,
            ResponseContentDisposition: `inline; filename="${fileData.name}"`,
            ResponseContentType: fileData.mimeType || "application/octet-stream",
        } ), { expiresIn: 3600 } )

        return { url: viewUrl }
    } )
