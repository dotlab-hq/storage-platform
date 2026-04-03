import { PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3"
import { Readable } from "node:stream"
import { db } from "@/db"
import { uploadAttempt } from "@/db/schema/s3-gateway"
import type { BucketContext } from "@/lib/s3-gateway/s3-context"
import { getProviderClientById, selectProviderForUpload } from "@/lib/s3-provider-client"
import { and, eq } from "drizzle-orm"
import { upsertCommittedFile } from "./upload-file-records"
import { buildUpstreamObjectKey, deriveFileName } from "./upload-key-utils"
import { ProviderRequestTimeoutError, sendWithProviderTimeout } from "./s3-provider-timeout"
import { normalizeETag } from "./s3-conditional-cache"

const MULTIPART_UPLOAD_EXPIRY_MS = 60 * 60 * 1000
const RETRYABLE_UPLOAD_STATUS_CODES = new Set<number>( [408, 429, 500, 502, 503, 504] )

type ErrorWithMetadata = {
    $metadata?: {
        httpStatusCode?: number
    }
}

function uploadErrorStatusCode( error: unknown ): number | null {
    if ( !error || typeof error !== "object" ) {
        return null
    }
    const metadata = ( error as ErrorWithMetadata ).$metadata
    if ( !metadata || typeof metadata.httpStatusCode !== "number" ) {
        return null
    }
    return metadata.httpStatusCode
}

function isRetryableUploadError( error: unknown ): boolean {
    if ( error instanceof ProviderRequestTimeoutError ) {
        return true
    }
    const statusCode = uploadErrorStatusCode( error )
    if ( statusCode !== null && RETRYABLE_UPLOAD_STATUS_CODES.has( statusCode ) ) {
        return true
    }
    if ( !( error instanceof Error ) ) {
        return false
    }
    return /timeout|econnreset|ehostunreach|enetunreach|network/i.test( `${error.name} ${error.message}` )
}

async function* streamWebChunks( stream: ReadableStream<Uint8Array> ): AsyncGenerator<Uint8Array> {
    const reader = stream.getReader()
    try {
        while ( true ) {
            const { done, value } = await reader.read()
            if ( done ) {
                return
            }
            if ( value ) {
                yield value
            }
        }
    } finally {
        reader.releaseLock()
    }
}

function toNodeReadable( stream: ReadableStream<Uint8Array> ): Readable {
    return Readable.from( streamWebChunks( stream ) )
}

export async function createMultipartUpload( bucket: BucketContext, objectKey: string, contentType: string | null ): Promise<string> {
    const attemptId = crypto.randomUUID()
    const provider = await selectProviderForUpload( 1 )
    await db.insert( uploadAttempt ).values( {
        id: attemptId,
        userId: bucket.userId,
        bucketId: bucket.bucketId,
        providerId: provider.providerId,
        objectKey,
        upstreamObjectKey: buildUpstreamObjectKey( bucket.userId, bucket.bucketId, objectKey ),
        expectedSize: 0,
        contentType,
        status: "pending",
        expiresAt: new Date( Date.now() + MULTIPART_UPLOAD_EXPIRY_MS ),
    } )

    return attemptId
}

export async function uploadPart(
    bucket: BucketContext,
    objectKey: string,
    uploadId: string,
    bodyAttempts: ReadableStream<Uint8Array>[],
    contentType: string | null,
    contentLength: number | null,
): Promise<string | null> {
    const rows = await db
        .select( {
            id: uploadAttempt.id,
            providerId: uploadAttempt.providerId,
            upstreamObjectKey: uploadAttempt.upstreamObjectKey,
        } )
        .from( uploadAttempt )
        .where( and( eq( uploadAttempt.id, uploadId ), eq( uploadAttempt.userId, bucket.userId ), eq( uploadAttempt.bucketId, bucket.bucketId ) ) )
        .limit( 1 )

    if ( rows.length === 0 ) {
        throw new Error( "Invalid or expired upload ID" )
    }

    const attempt = rows[0]
    const provider = await getProviderClientById( attempt.providerId )
    if ( bodyAttempts.length === 0 ) {
        throw new Error( "Request body stream is required" )
    }

    let result: { ETag?: string } | null = null
    let lastError: unknown = null
    for ( let index = 0; index < bodyAttempts.length; index += 1 ) {
        const attemptBody = bodyAttempts[index]
        try {
            result = await sendWithProviderTimeout( ( abortSignal ) => provider.client.send( new PutObjectCommand( {
                Bucket: provider.bucketName,
                Key: attempt.upstreamObjectKey,
                Body: toNodeReadable( attemptBody ),
                ContentType: contentType ?? "application/octet-stream",
                ContentLength: contentLength ?? undefined,
            } ), { abortSignal } ) )
            break
        } catch ( error ) {
            lastError = error
            const canRetry = index < bodyAttempts.length - 1 && isRetryableUploadError( error )
            if ( !canRetry ) {
                throw error
            }
        }
    }

    if ( !result ) {
        throw lastError instanceof Error ? lastError : new Error( "Part upload failed after retry attempts" )
    }

    await db
        .update( uploadAttempt )
        .set( {
            objectKey,
            expectedSize: contentLength ?? 0,
            etag: result.ETag ?? null,
            contentType,
        } )
        .where( eq( uploadAttempt.id, uploadId ) )

    return result.ETag ?? null
}

export async function completeMultipartUpload( bucket: BucketContext, uploadId: string ): Promise<string> {
    const rows = await db
        .select( {
            id: uploadAttempt.id,
            providerId: uploadAttempt.providerId,
            objectKey: uploadAttempt.objectKey,
            upstreamObjectKey: uploadAttempt.upstreamObjectKey,
            contentType: uploadAttempt.contentType,
            status: uploadAttempt.status,
            etag: uploadAttempt.etag,
        } )
        .from( uploadAttempt )
        .where( and( eq( uploadAttempt.id, uploadId ), eq( uploadAttempt.userId, bucket.userId ), eq( uploadAttempt.bucketId, bucket.bucketId ) ) )
        .limit( 1 )

    if ( rows.length === 0 ) {
        throw new Error( "Invalid or expired upload ID" )
    }

    const attempt = rows[0]
    const provider = await getProviderClientById( attempt.providerId )
    const head = await sendWithProviderTimeout( ( abortSignal ) => provider.client.send( new HeadObjectCommand( {
        Bucket: provider.bucketName,
        Key: attempt.upstreamObjectKey,
    } ), { abortSignal } ) )

    const observedSize = Number( head.ContentLength ?? 0 )
    let eTag = ""
    if ( head.ETag ) {
        eTag = normalizeETag( head.ETag )
    } else if ( attempt.etag ) {
        eTag = normalizeETag( attempt.etag )
    }

    await upsertCommittedFile( {
        userId: bucket.userId,
        providerId: attempt.providerId,
        objectKey: attempt.upstreamObjectKey,
        contentType: attempt.contentType,
        mappedFolderId: bucket.mappedFolderId,
        fileName: deriveFileName( attempt.objectKey ),
        sizeInBytes: observedSize,
        etag: eTag || null,
        cacheControl: head.CacheControl ?? null,
        lastModified: head.LastModified ?? new Date(),
    } )

    await db
        .update( uploadAttempt )
        .set( {
            status: "uploaded",
            etag: eTag,
            completedAt: new Date(),
            errorMessage: null,
        } )
        .where( eq( uploadAttempt.id, uploadId ) )

    return eTag
}

export async function abortMultipartUpload( bucket: BucketContext, uploadId: string ): Promise<void> {
    await db
        .update( uploadAttempt )
        .set( {
            status: "failed",
            errorMessage: "aborted",
        } )
        .where( and( eq( uploadAttempt.id, uploadId ), eq( uploadAttempt.userId, bucket.userId ), eq( uploadAttempt.bucketId, bucket.bucketId ) ) )
}
