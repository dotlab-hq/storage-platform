import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { decodeNavToken } from '@/lib/nav-token'
import type { NavPayload } from '@/lib/nav-token';
import { getAuthenticatedUser } from '@/lib/server-auth'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { eq, and } from 'drizzle-orm'
import { db } from '@/db'
import { file as storageFile } from '@/db/schema/storage'
import { storageProvider } from '@/db/schema/storage-provider'
import { getProviderClientById } from '@/lib/s3-provider-client'

const FileLinkSchema = z.object( {
    nav: z.string().min( 1 ),
} )

export const Route = createFileRoute( '/api/storage/file-link' as never )( {
    component: () => null,
    server: {
        handlers: {
            GET: async ( { request } ) => {
                try {
                    const url = new URL( request.url )
                    const navParam = url.searchParams.get( 'nav' )

                    if ( !navParam ) {
                        return new Response( 'Missing nav parameter', { status: 400 } )
                    }

                    const navPayload = decodeNavToken( navParam )
                    if ( !navPayload || !navPayload.fileId ) {
                        return new Response( 'Invalid nav token', { status: 400 } )
                    }

                    const user = await getAuthenticatedUser()
                    const fileId = navPayload.fileId
                    const userId = user.id

                    // Get file details
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
                        return new Response( 'File not found or access denied', {
                            status: 404,
                        } )
                    }

                    const fileData = fileRows[0]

                    if ( !fileData.providerId || !fileData.bucketName ) {
                        return new Response( 'File configuration invalid', { status: 500 } )
                    }

                    const { client } = await getProviderClientById( fileData.providerId )
                    const objectKey = fileData.objectKey

                    // Generate presigned URL
                    const presignedUrl = await getSignedUrl(
                        client,
                        new GetObjectCommand( {
                            Bucket: fileData.bucketName,
                            Key: objectKey,
                            ResponseContentDisposition: `inline; filename="${fileData.name}"`,
                            ResponseContentType:
                                fileData.mimeType || 'application/octet-stream',
                        } ),
                        { expiresIn: 3600 },
                    )

                    // Redirect to presigned URL
                    return new Response( null, {
                        status: 302,
                        headers: {
                            Location: presignedUrl,
                        },
                    } )
                } catch ( error ) {
                    console.error( 'File-link error:', error )
                    return new Response( 'Internal server error', { status: 500 } )
                }
            },
        },
    },
} )
