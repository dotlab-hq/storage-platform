import {
    DeleteObjectCommand,
    GetObjectCommand,
    ListObjectsV2Command,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import { getAuthenticatedUser } from "@/lib/server-auth"
import { getVirtualBucketCredentials } from "@/lib/s3-gateway/virtual-buckets"

const BucketSchema = z.object( {
    bucketName: z.string().trim().min( 3 ).max( 63 ),
} )

const ListSchema = BucketSchema.extend( {
    prefix: z.string().trim().optional(),
    maxKeys: z.number().int().min( 1 ).max( 1000 ).default( 100 ),
} )

const ObjectKeySchema = BucketSchema.extend( {
    objectKey: z.string().trim().min( 1 ),
} )

const UploadSchema = ObjectKeySchema.extend( {
    contentBase64: z.string().min( 1 ),
    contentType: z.string().trim().optional(),
} )

const PresignSchema = ObjectKeySchema.extend( {
    expiresInSeconds: z.number().int().min( 60 ).max( 3600 ).default( 900 ),
} )

type ViewerClient = {
    client: S3Client
    credentials: Awaited<ReturnType<typeof getVirtualBucketCredentials>>
}

async function getViewerClient( bucketName: string ): Promise<ViewerClient> {
    const user = await getAuthenticatedUser()
    const credentials = await getVirtualBucketCredentials( user.id, bucketName )
    return {
        credentials,
        client: new S3Client( {
            region: credentials.region,
            endpoint: `${credentials.endpoint}/api/storage/s3`,
            forcePathStyle: true,
            credentials: {
                accessKeyId: credentials.accessKeyId,
                secretAccessKey: credentials.secretAccessKey,
            },
        } ),
    }
}

export const getS3ViewerCredentialsFn = createServerFn( { method: "GET" } )
    .inputValidator( BucketSchema )
    .handler( async ( { data } ) => {
        const user = await getAuthenticatedUser()
        return getVirtualBucketCredentials( user.id, data.bucketName )
    } )

export const listS3ViewerObjectsFn = createServerFn( { method: "GET" } )
    .inputValidator( ListSchema )
    .handler( async ( { data } ) => {
        const { client } = await getViewerClient( data.bucketName )
        const result = await client.send(
            new ListObjectsV2Command( {
                Bucket: data.bucketName,
                Prefix: data.prefix && data.prefix.length > 0 ? data.prefix : undefined,
                MaxKeys: data.maxKeys,
            } ),
        )

        return {
            keyCount: result.KeyCount ?? 0,
            isTruncated: result.IsTruncated ?? false,
            objects: ( result.Contents ?? [] ).map( ( entry ) => ( {
                key: entry.Key ?? "",
                sizeInBytes: entry.Size ?? 0,
                eTag: entry.ETag ?? null,
                lastModified: entry.LastModified ? entry.LastModified.toISOString() : null,
            } ) ),
        }
    } )

export const deleteS3ViewerObjectFn = createServerFn( { method: "POST" } )
    .inputValidator( ObjectKeySchema )
    .handler( async ( { data } ) => {
        const { client } = await getViewerClient( data.bucketName )
        await client.send(
            new DeleteObjectCommand( {
                Bucket: data.bucketName,
                Key: data.objectKey,
            } ),
        )

        return { ok: true }
    } )

export const uploadS3ViewerObjectFn = createServerFn( { method: "POST" } )
    .inputValidator( UploadSchema )
    .handler( async ( { data } ) => {
        const { client } = await getViewerClient( data.bucketName )
        const content = Buffer.from( data.contentBase64, "base64" )

        await client.send(
            new PutObjectCommand( {
                Bucket: data.bucketName,
                Key: data.objectKey,
                Body: content,
                ContentType: data.contentType && data.contentType.length > 0
                    ? data.contentType
                    : undefined,
            } ),
        )

        return { ok: true, uploadedBytes: content.byteLength }
    } )

export const createS3ViewerPresignUrlFn = createServerFn( { method: "POST" } )
    .inputValidator( PresignSchema )
    .handler( async ( { data } ) => {
        const { client } = await getViewerClient( data.bucketName )
        const url = await getSignedUrl(
            client,
            new GetObjectCommand( {
                Bucket: data.bucketName,
                Key: data.objectKey,
            } ),
            { expiresIn: data.expiresInSeconds },
        )

        return { url }
    } )
