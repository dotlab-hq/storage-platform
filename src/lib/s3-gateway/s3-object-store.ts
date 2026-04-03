import {
    HeadObjectCommand,
    PutObjectCommand,
    GetObjectCommand,
} from "@aws-sdk/client-s3"
import { Readable } from "node:stream"
import type { BucketContext } from "@/lib/s3-gateway/s3-context"
import { buildCacheHeaders, normalizeETag, shouldReturnNotModified } from "@/lib/s3-gateway/s3-conditional-cache"
import { findStoredObject } from "@/lib/s3-gateway/s3-stored-object"
import type { ObjectConditionalHeaders } from "@/lib/s3-gateway/s3-conditional-cache"
import { getProviderClientById, selectProviderForUpload } from "@/lib/s3-provider-client"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { and, eq, like } from "drizzle-orm"
import { db } from "@/db"
import { file } from "@/db/schema/storage"
import { ProviderRequestTimeoutError, sendWithProviderTimeout } from "./s3-provider-timeout"
import { upsertCommittedFile } from "./upload-file-records"
import { buildUpstreamObjectKey, deriveFileName } from "./upload-key-utils"

/**
 * Short redirect TTL limits exposure of presigned URLs in transit or logs
 * while still allowing normal immediate client follow-redirect download behavior.
 */
const GET_OBJECT_REDIRECT_TTL_SECONDS = 60

async function* streamWebChunks( stream: ReadableStream<Uint8Array> ): AsyncGenerator<Uint8Array> {
    const reader = stream.getReader()
    try {
        for ( ; ; ) {
            const { done, value } = await reader.read()
            if ( done ) {
                return
            }
            yield value
        }
    } finally {
        reader.releaseLock()
    }
}

function toNodeReadable( stream: ReadableStream<Uint8Array> ): Readable {
    return Readable.from( streamWebChunks( stream ) )
}

function upstreamKeyFor( bucket: BucketContext, objectKey: string ): string {
    return buildUpstreamObjectKey( bucket.userId, bucket.bucketId, bucket.mappedFolderId, objectKey )
}

function bucketPrefix( bucket: BucketContext ): string {
    const folderSegment = bucket.mappedFolderId ? `${bucket.mappedFolderId}/` : ""
    return `s3/${bucket.userId}/${bucket.bucketId}/${folderSegment}`
}

export type ListedS3Object = {
    key: string
    size: number
    eTag: string | null
    lastModified: Date
}

export async function listObjectsV2( bucket: BucketContext, prefix: string ): Promise<ListedS3Object[]> {
    const basePrefix = bucketPrefix( bucket )
    let rows: Array<{
        objectKey: string
        sizeInBytes: number
        etag: string | null
        lastModified: Date | null
        updatedAt: Date | null
    }>

    try {
        rows = await db
            .select( {
                objectKey: file.objectKey,
                sizeInBytes: file.sizeInBytes,
                etag: file.etag,
                lastModified: file.lastModified,
                updatedAt: file.updatedAt,
            } )
            .from( file )
            .where( and( eq( file.userId, bucket.userId ), eq( file.isDeleted, false ), like( file.objectKey, `${basePrefix}%` ) ) )
    } catch ( error ) {
        const message = error instanceof Error ? `${error.name}: ${error.message}` : "Unknown query error"
        console.warn( "[S3 Gateway] listObjectsV2 fell back to minimal file query due to schema mismatch:", message )
        try {
            const fallbackRows = await db
                .select( {
                    objectKey: file.objectKey,
                    sizeInBytes: file.sizeInBytes,
                } )
                .from( file )
                .where( like( file.objectKey, `${basePrefix}%` ) )

            rows = fallbackRows.map( ( row ) => ( {
                objectKey: row.objectKey,
                sizeInBytes: row.sizeInBytes,
                etag: null,
                lastModified: null,
                updatedAt: null,
            } ) )
        } catch ( fallbackError ) {
            const fallbackMessage = fallbackError instanceof Error ? `${fallbackError.name}: ${fallbackError.message}` : "Unknown fallback query error"
            console.warn( "[S3 Gateway] listObjectsV2 degraded to object_key-only query due to legacy schema mismatch:", fallbackMessage )

            const keyOnlyRows = await db
                .select( {
                    objectKey: file.objectKey,
                } )
                .from( file )
                .where( like( file.objectKey, `${basePrefix}%` ) )

            rows = keyOnlyRows.map( ( row ) => ( {
                objectKey: row.objectKey,
                sizeInBytes: 0,
                etag: null,
                lastModified: null,
                updatedAt: null,
            } ) )
        }
    }

    return rows
        .map( ( row ) => {
            const key = row.objectKey.startsWith( basePrefix )
                ? row.objectKey.slice( basePrefix.length )
                : row.objectKey
            return {
                key,
                size: row.sizeInBytes,
                eTag: row.etag,
                lastModified: row.lastModified ?? row.updatedAt ?? new Date( 0 ),
            }
        } )
        .filter( ( row ) => row.key.startsWith( prefix ) )
}

export async function putObject(
    bucket: BucketContext,
    objectKey: string,
    body: ReadableStream<Uint8Array>,
    contentType: string | null,
    contentLength: number | null,
): Promise<string | null> {
    const provider = await selectProviderForUpload( contentLength ?? 0 )
    const upstreamKey = upstreamKeyFor( bucket, objectKey )
    const result = await sendWithProviderTimeout( ( abortSignal ) => provider.client.send( new PutObjectCommand( {
        Bucket: provider.bucketName,
        Key: upstreamKey,
        Body: toNodeReadable( body ),
        ContentType: contentType ?? "application/octet-stream",
        ContentLength: contentLength ?? undefined,
    } ), { abortSignal } ) )

    let metadataETag: string | undefined
    let metadataCacheControl: string | undefined
    let metadataLastModified: Date | undefined
    let metadataContentLength: number | undefined
    try {
        const metadata = await sendWithProviderTimeout( ( abortSignal ) => provider.client.send( new HeadObjectCommand( {
            Bucket: provider.bucketName,
            Key: upstreamKey,
        } ), { abortSignal } ) )
        metadataETag = metadata.ETag
        metadataCacheControl = metadata.CacheControl
        metadataLastModified = metadata.LastModified
        metadataContentLength = typeof metadata.ContentLength === "number" ? metadata.ContentLength : undefined
    } catch ( error ) {
        if ( error instanceof ProviderRequestTimeoutError ) {
            throw error
        }
        const message = error instanceof Error ? `${error.name}: ${error.message}` : "Unknown provider metadata error"
        console.warn( "[S3 Gateway] Non-fatal HeadObject metadata fetch failure after PUT:", message )
    }

    await upsertCommittedFile( {
        userId: bucket.userId,
        providerId: provider.providerId,
        objectKey: upstreamKey,
        contentType,
        mappedFolderId: bucket.mappedFolderId,
        fileName: deriveFileName( objectKey ),
        sizeInBytes: metadataContentLength ?? contentLength ?? 0,
        // Prefer HEAD metadata ETag because provider PutObject responses may omit ETag in some configurations.
        etag: resolvePersistedETag( metadataETag, result.ETag ),
        cacheControl: metadataCacheControl ?? null,
        lastModified: metadataLastModified ?? new Date(),
    } )

    return result.ETag ?? null
}

function assertPresignedUrlEndpoint( presignedUrl: string, providerEndpoint: string ): void {
    const signedUrl = new URL( presignedUrl )
    const expected = new URL( providerEndpoint )
    if ( signedUrl.protocol !== expected.protocol || signedUrl.host !== expected.host ) {
        throw new Error( "Generated redirect URL endpoint does not match configured provider endpoint" )
    }
}

/**
 * Persists ETag with provider HEAD result taking precedence over PUT response ETag.
 * Some providers omit ETag on PUT, while HEAD is more reliable after object commit.
 */
function resolvePersistedETag( metadataETag: string | undefined, putResultETag: string | undefined ): string | null {
    if ( metadataETag !== undefined ) return normalizeETag( metadataETag )
    if ( putResultETag !== undefined ) return normalizeETag( putResultETag )
    return null
}

export async function getObject( bucket: BucketContext, objectKey: string, conditionals: ObjectConditionalHeaders ): Promise<Response | null> {
    const stored = await findStoredObject( bucket, objectKey )
    if ( !stored ) {
        return null
    }

    const provider = await getProviderClientById( stored.providerId )
    const effectiveLastModified = stored.lastModified ?? stored.updatedAt
    const should304 = shouldReturnNotModified( {
        eTag: stored.etag,
        lastModified: effectiveLastModified,
        ifNoneMatch: conditionals.ifNoneMatch,
        ifModifiedSince: conditionals.ifModifiedSince,
    } )
    if ( should304 ) {
        return new Response( null, {
            status: 304,
            headers: buildCacheHeaders( {
                eTag: stored.etag,
                lastModified: effectiveLastModified,
                cacheControl: stored.cacheControl,
                includeDefaultCacheControl: false,
            } ),
        } )
    }

    const command = new GetObjectCommand( {
        Bucket: provider.bucketName,
        Key: stored.objectKey,
        ResponseContentType: stored.mimeType ?? undefined,
    } )
    const presignedUrl = await getSignedUrl( provider.client, command, { expiresIn: GET_OBJECT_REDIRECT_TTL_SECONDS } )
    assertPresignedUrlEndpoint( presignedUrl, provider.endpoint )
    const headers = buildCacheHeaders( {
        eTag: stored.etag,
        lastModified: effectiveLastModified,
        cacheControl: stored.cacheControl,
    } )
    headers.set( "Content-Type", stored.mimeType ?? "application/octet-stream" )
    headers.set( "Content-Length", String( stored.sizeInBytes ) )
    headers.set( "Location", presignedUrl )

    return new Response( null, {
        status: 302,
        headers,
    } )
}

export async function headObject( bucket: BucketContext, objectKey: string, conditionals: ObjectConditionalHeaders ): Promise<Response | null> {
    const stored = await findStoredObject( bucket, objectKey )
    if ( !stored ) {
        return null
    }

    const effectiveLastModified = stored.lastModified ?? stored.updatedAt
    const should304 = shouldReturnNotModified( {
        eTag: stored.etag,
        lastModified: effectiveLastModified,
        ifNoneMatch: conditionals.ifNoneMatch,
        ifModifiedSince: conditionals.ifModifiedSince,
    } )
    if ( should304 ) {
        return new Response( null, {
            status: 304,
            headers: buildCacheHeaders( {
                eTag: stored.etag,
                lastModified: effectiveLastModified,
                cacheControl: stored.cacheControl,
                includeDefaultCacheControl: false,
            } ),
        } )
    }
    const headers = buildCacheHeaders( {
        eTag: stored.etag,
        lastModified: effectiveLastModified,
        cacheControl: stored.cacheControl,
    } )
    headers.set( "Content-Type", stored.mimeType ?? "application/octet-stream" )
    headers.set( "Content-Length", String( stored.sizeInBytes ) )

    return new Response( null, {
        status: 200,
        headers,
    } )
}

export async function deleteObject( bucket: BucketContext, objectKey: string ): Promise<void> {
    const upstreamKey = upstreamKeyFor( bucket, objectKey )
    try {
        await db
            .update( file )
            .set( {
                isDeleted: true,
                deletedAt: new Date(),
            } )
            .where( and( eq( file.userId, bucket.userId ), eq( file.objectKey, upstreamKey ), eq( file.isDeleted, false ) ) )
    } catch ( error ) {
        const message = error instanceof Error ? `${error.name}: ${error.message}` : "Unknown query error"
        console.warn( "[S3 Gateway] deleteObject fell back to hard delete due to schema mismatch:", message )

        await db
            .delete( file )
            .where( eq( file.objectKey, upstreamKey ) )
    }
}
