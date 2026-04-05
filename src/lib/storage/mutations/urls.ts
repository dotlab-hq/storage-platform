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
import { buildStorageObjectKey } from '@/lib/file-type-utils'

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
        const objectKey = buildStorageObjectKey( userId, fileData.id )
        const url = await getSignedUrl(client, new GetObjectCommand({ Bucket: fileData.bucketName, Key: objectKey }), { expiresIn: 3600 })

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

        const { client, endpoint } = await getProviderClientById(
            fileData.providerId,
        )

        const s3ClientExt = client as any
        const objectKey = buildStorageObjectKey( userId, fileData.id )
        const encodedKey = objectKey
            .split( '/' )
            .map( ( part ) => encodeURIComponent( part ) )
            .join( '/' )

        const isAws = endpoint.includes( 'amazonaws.com' )
        let downloadUrl = ''

        if ( isAws ) {
            let region = 'us-east-1'
            if ( s3ClientExt.region ) {
                region = typeof s3ClientExt.region === 'string'
                    ? s3ClientExt.region
                    : await s3ClientExt.region()
            }
            if ( true ) {
                downloadUrl = `https://s3.${region}.amazonaws.com/${fileData.bucketName}/${encodedKey}`
            } else {
                downloadUrl = `https://${fileData.bucketName}.s3.${region}.amazonaws.com/${encodedKey}`
            }
        } else {
            const u = new URL(
                endpoint.startsWith( 'http' ) ? endpoint : `https://${endpoint}`,
            )
            if ( true ) {
                downloadUrl = `${u.origin}/${fileData.bucketName}/${encodedKey}`
            } else {
                downloadUrl = `${u.protocol}//${fileData.bucketName}.${u.host}/${encodedKey}`
            }
        }

        return { url: downloadUrl }
    } )
