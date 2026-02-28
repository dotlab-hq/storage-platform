import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

const S3PresignedUrlSchema = z.object( {
    userId: z.string().min( 1 ),
    objectKey: z.string().min( 1 ),
    contentType: z.string().min( 1 ),
    fileSize: z.number().min( 1 ),
} )

type PresignedUrlInput = z.infer<typeof S3PresignedUrlSchema>

export const getS3PresignedUrl = createServerFn( { method: 'POST' } )
    .inputValidator( ( d ) => S3PresignedUrlSchema.parse( d ) )
    .handler( async ( { data } ) => {
        console.log( '[Server] Getting presigned URL for:', data )
        const { PutObjectCommand, S3Client } = await import( '@aws-sdk/client-s3' )
        const { getSignedUrl } = await import( '@aws-sdk/s3-request-presigner' )

        const s3Client = new S3Client( {
            region: process.env.S3_REGION,
            endpoint: process.env.S3_ENDPOINT,
            forcePathStyle: true,
            bucketEndpoint: false,
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID!,
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
            },
        } )

        const command = new PutObjectCommand( {
            Bucket: 'dot-storage',
            Key: data.objectKey,
            ContentType: data.contentType,
            ContentLength: data.fileSize,
        } )

        const presignedUrl = await getSignedUrl( s3Client, command, { expiresIn: 3600 } )
        console.log( '[Server] Presigned URL generated successfully' )
        return { presignedUrl }
    } )

const RegisterFileSchema = z.object( {
    userId: z.string().min( 1 ),
    fileName: z.string().min( 1 ),
    objectKey: z.string().min( 1 ),
    mimeType: z.string(),
    fileSize: z.number().min( 0 ),
    parentFolderId: z.string().nullable().optional(),
} )

export const registerUploadedFile = createServerFn( { method: 'POST' } )
    .inputValidator( ( d ) => RegisterFileSchema.parse( d ) )
    .handler( async ( { data } ) => {
        console.log( '[Server] Registering file:', data.fileName )
        const [{ db }, { file: storageFile }] = await Promise.all( [
            import( '@/db' ),
            import( '@/db/schema/storage' ),
        ] )

        const [insertedFile] = await db
            .insert( storageFile )
            .values( {
                name: data.fileName,
                objectKey: data.objectKey,
                mimeType: data.mimeType || null,
                sizeInBytes: data.fileSize,
                userId: data.userId,
                folderId: data.parentFolderId || null,
            } )
            .returning( {
                id: storageFile.id,
                name: storageFile.name,
                createdAt: storageFile.createdAt,
            } )

        console.log( '[Server] File registered successfully' )
        return { file: insertedFile }
    } )
