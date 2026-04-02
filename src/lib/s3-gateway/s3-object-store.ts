import {
    GetObjectCommand,
    HeadObjectCommand,
    PutObjectCommand,
} from "@aws-sdk/client-s3"
import type { BucketContext } from "@/lib/s3-gateway/s3-context"
import { buildCacheHeaders, isStatusMetadataError, parseHttpDate } from "@/lib/s3-gateway/s3-conditional-cache"
import { findStoredObject } from "@/lib/s3-gateway/s3-stored-object"
import type { ObjectConditionalHeaders } from "@/lib/s3-gateway/s3-conditional-cache"
import { getProviderClientById, selectProviderForUpload } from "@/lib/s3-provider-client"
import { and, eq, like } from "drizzle-orm"
import { db } from "@/db"
import { file } from "@/db/schema/storage"
import { sendWithProviderTimeout } from "./s3-provider-timeout"
import { upsertCommittedFile } from "./upload-file-records"
import { buildUpstreamObjectKey, deriveFileName } from "./upload-key-utils"

function upstreamKeyFor( bucket: BucketContext, objectKey: string ): string {
    return buildUpstreamObjectKey( bucket.userId, bucket.bucketId, objectKey )
}

function bucketPrefix( bucket: BucketContext ): string {
    return `s3/${bucket.userId}/${bucket.bucketId}/`
}

export type ListedS3Object = {
    key: string
    size: number
    eTag: string | null
    lastModified: Date
}

export async function listObjectsV2( bucket: BucketContext, prefix: string ): Promise<ListedS3Object[]> {
    const basePrefix = bucketPrefix( bucket )
    const rows = await db
        .select( {
            objectKey: file.objectKey,
            sizeInBytes: file.sizeInBytes,
            updatedAt: file.updatedAt,
        } )
        .from( file )
        .where( and( eq( file.userId, bucket.userId ), eq( file.isDeleted, false ), like( file.objectKey, `${basePrefix}%` ) ) )

    return rows
        .map( ( row ) => {
            const key = row.objectKey.startsWith( basePrefix )
                ? row.objectKey.slice( basePrefix.length )
                : row.objectKey
            return {
                key,
                size: row.sizeInBytes,
                eTag: null,
                lastModified: row.updatedAt,
            }
        } )
        .filter( ( row ) => row.key.startsWith( prefix ) )
}

export async function putObject( bucket: BucketContext, objectKey: string, body: Uint8Array, contentType: string | null ): Promise<string | null> {
    const provider = await selectProviderForUpload( body.byteLength )
    const upstreamKey = upstreamKeyFor( bucket, objectKey )

    const result = await sendWithProviderTimeout( ( abortSignal ) => provider.client.send( new PutObjectCommand( {
        Bucket: provider.bucketName,
        Key: upstreamKey,
        Body: body,
        ContentType: contentType ?? "application/octet-stream",
    } ), { abortSignal } ) )

    await upsertCommittedFile( {
        userId: bucket.userId,
        providerId: provider.providerId,
        objectKey: upstreamKey,
        contentType,
        mappedFolderId: bucket.mappedFolderId,
        fileName: deriveFileName( objectKey ),
        sizeInBytes: body.byteLength,
    } )

    return result.ETag ?? null
}

async function headProviderObject( input: {
    provider: Awaited<ReturnType<typeof getProviderClientById>>
    objectKey: string
} ) {
    return sendWithProviderTimeout( ( abortSignal ) => input.provider.client.send( new HeadObjectCommand( {
        Bucket: input.provider.bucketName,
        Key: input.objectKey,
    } ), { abortSignal } ) )
}

export async function getObject( bucket: BucketContext, objectKey: string, conditionals: ObjectConditionalHeaders ): Promise<Response | null> {
    const stored = await findStoredObject( bucket, objectKey )
    if ( !stored ) {
        return null
    }

    const provider = await getProviderClientById( stored.providerId )
    let eTag: string | null | undefined
    let lastModified: Date | undefined
    let cacheControl: string | null | undefined

    try {
        const result = await sendWithProviderTimeout( ( abortSignal ) => provider.client.send( new GetObjectCommand( {
            Bucket: provider.bucketName,
            Key: stored.objectKey,
            IfNoneMatch: conditionals.ifNoneMatch ?? undefined,
            IfModifiedSince: parseHttpDate( conditionals.ifModifiedSince ),
        } ), { abortSignal } ) )

        eTag = result.ETag
        lastModified = result.LastModified
        cacheControl = result.CacheControl
        const headers = buildCacheHeaders( { eTag, lastModified, cacheControl } )
        headers.set( "Content-Type", stored.mimeType ?? "application/octet-stream" )
        headers.set( "Content-Length", String( stored.sizeInBytes ) )

        return new Response( result.Body as ReadableStream, {
            status: 200,
            headers,
        } )
    } catch ( error: unknown ) {
        if ( isStatusMetadataError( error ) && error.$metadata?.httpStatusCode === 304 ) {
            const metadata = await headProviderObject( { provider, objectKey: stored.objectKey } )
            eTag = metadata.ETag
            lastModified = metadata.LastModified
            cacheControl = metadata.CacheControl
            return new Response( null, {
                status: 304,
                headers: buildCacheHeaders( { eTag, lastModified, cacheControl, includeDefaultCacheControl: false } ),
            } )
        }
        throw error
    }
}

export async function headObject( bucket: BucketContext, objectKey: string, conditionals: ObjectConditionalHeaders ): Promise<Response | null> {
    const stored = await findStoredObject( bucket, objectKey )
    if ( !stored ) {
        return null
    }

    const provider = await getProviderClientById( stored.providerId )
    let eTag: string | null | undefined
    let lastModified: Date | undefined
    let cacheControl: string | null | undefined

    try {
        const result = await sendWithProviderTimeout( ( abortSignal ) => provider.client.send( new HeadObjectCommand( {
            Bucket: provider.bucketName,
            Key: stored.objectKey,
            IfNoneMatch: conditionals.ifNoneMatch ?? undefined,
            IfModifiedSince: parseHttpDate( conditionals.ifModifiedSince ),
        } ), { abortSignal } ) )

        eTag = result.ETag
        lastModified = result.LastModified
        cacheControl = result.CacheControl
        const headers = buildCacheHeaders( { eTag, lastModified, cacheControl } )
        headers.set( "Content-Type", stored.mimeType ?? "application/octet-stream" )
        headers.set( "Content-Length", String( result.ContentLength ?? stored.sizeInBytes ) )

        return new Response( null, {
            status: 200,
            headers,
        } )
    } catch ( error: unknown ) {
        if ( isStatusMetadataError( error ) && error.$metadata?.httpStatusCode === 304 ) {
            const metadata = await headProviderObject( { provider, objectKey: stored.objectKey } )
            eTag = metadata.ETag
            lastModified = metadata.LastModified
            cacheControl = metadata.CacheControl
            return new Response( null, {
                status: 304,
                headers: buildCacheHeaders( { eTag, lastModified, cacheControl, includeDefaultCacheControl: false } ),
            } )
        }
        throw error
    }
}

export async function deleteObject( bucket: BucketContext, objectKey: string ): Promise<void> {
    const upstreamKey = upstreamKeyFor( bucket, objectKey )
    await db
        .update( file )
        .set( {
            isDeleted: true,
            deletedAt: new Date(),
        } )
        .where( and( eq( file.userId, bucket.userId ), eq( file.objectKey, upstreamKey ), eq( file.isDeleted, false ) ) )
}
