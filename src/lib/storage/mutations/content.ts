import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { getAuthenticatedUser } from '@/lib/server-auth'
import { db } from '@/db'
import { file as storageFile } from '@/db/schema/storage'
import { storageProvider } from '@/db/schema/storage-provider'
import { getProviderClientById } from '@/lib/s3-provider-client'
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import {
    buildStorageObjectKey,
    getMimeTypeFromFileName,
    isTextBasedFile,
} from '@/lib/file-type-utils'

const ContentSchema = z.object( {
    fileId: z.string().min( 1 ),
} )

const SaveContentSchema = z.object( {
    fileId: z.string().min( 1 ),
    content: z.string(),
    name: z.string().min( 1 ),
} )

export const getTextFileContentFn = createServerFn( { method: 'GET' } )
    .inputValidator( ContentSchema )
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

        if ( !isTextBasedFile( fileData.name, null ) ) {
            throw new Error( 'Not a text file' )
        }

        if ( !fileData.providerId || !fileData.bucketName ) {
            throw new Error( 'File configuration invalid' )
        }

        const { client } = await getProviderClientById( fileData.providerId )
        const objectKey = buildStorageObjectKey( userId, fileData.id )

        // AWS SDK approach via Minio compat (using their getObject signature)
        let content = ''
        try {
            const getObjResp = await client.send( new GetObjectCommand( { Bucket: fileData.bucketName, Key: objectKey } ) ); const stream: any = getObjResp.Body
            content = await new Promise<string>( ( resolve, reject ) => {
                const chunks: Buffer[] = []
                stream.on( 'data', ( chunk: Buffer ) => chunks.push( chunk ) )
                stream.on( 'end', () => resolve( Buffer.concat( chunks ).toString( 'utf-8' ) ) )
                stream.on( 'error', reject )
            } )
        } catch ( e ) {
            throw new Error( 'Failed to retrieve object content: ' + ( e as Error ).message )
        }

        return { content, name: fileData.name }
    } )

export const saveTextFileFn = createServerFn( { method: 'POST' } )
    .inputValidator( SaveContentSchema )
    .handler( async ( { data } ) => {
        const user = await getAuthenticatedUser()
        const userId = user.id
        const { fileId, content, name } = data

        const fileRows = await db
            .select( {
                id: storageFile.id,
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

        if ( !fileData.providerId || !fileData.bucketName ) {
            throw new Error( 'File configuration invalid' )
        }

        const mimeType = getMimeTypeFromFileName( name )
        const size = Buffer.byteLength( content, 'utf-8' )
        const { client } = await getProviderClientById( fileData.providerId )
        const objectKey = buildStorageObjectKey( userId, fileData.id )
        const buffer = Buffer.from( content, 'utf-8' )

        try {
            await client.send( new PutObjectCommand( {
                Bucket: fileData.bucketName,
                Key: objectKey,
                Body: buffer,
                ContentLength: size,
                ContentType: mimeType || undefined
            } ) )

            // Update database row
            await db
                .update( storageFile )
                .set( {
                    name: name,
                    mimeType: mimeType,
                    updatedAt: new Date(),
                } )
                .where( and( eq( storageFile.id, fileId ), eq( storageFile.userId, userId ) ) )
        } catch ( e ) {
            throw new Error( 'Failed to write object: ' + ( e as Error ).message )
        }

        return { success: true }
    } )
