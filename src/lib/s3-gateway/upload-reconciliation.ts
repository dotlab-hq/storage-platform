import { HeadObjectCommand } from "@aws-sdk/client-s3"
import { getProviderClientById } from "@/lib/s3-provider-client"
import { normalizeETag } from "./s3-conditional-cache"
import { incrementReconciliationMetric } from "./upload-reconciliation-metrics"
import { findAttempt, markFailed, markUploaded, touchCheckSchedule } from "./upload-reconciliation-queries"
import { ProviderRequestTimeoutError, sendWithProviderTimeout } from "./s3-provider-timeout"
import { findCommittedFile, upsertCommittedFile } from "./upload-file-records"
import type { HeadObjectCommandOutput } from "@aws-sdk/client-s3"
import type { AttemptRow } from "./upload-reconciliation-types"
import type { CompletedUpload } from "./upload-file-records"
import { deriveFileName } from "./upload-key-utils"

const LAZY_RECHECK_MS = 10_000
const FAILURE_BUFFER_MS = 2 * 60 * 1000

function cutoffAt( expiresAt: Date ): Date {
    return new Date( expiresAt.getTime() + FAILURE_BUFFER_MS )
}

function isMissingObjectError( error: unknown ): boolean {
    if ( !( error instanceof Error ) ) return false
    const withCode = error as Error & { code?: string; Code?: string; $metadata?: { httpStatusCode?: number } }
    return withCode.$metadata?.httpStatusCode === 404
        || withCode.name === "NotFound"
        || withCode.code === "NotFound"
        || withCode.code === "NoSuchKey"
        || withCode.Code === "NoSuchKey"
}

async function finalizeUploaded( attempt: AttemptRow, head: HeadObjectCommandOutput, clientEtag?: string ): Promise<CompletedUpload> {
    const observedSize = Number( head.ContentLength ?? 0 )
    if ( observedSize !== attempt.expectedSize ) {
        await markFailed( attempt.id, "Uploaded size mismatch", new Date() )
        throw new Error( "Uploaded object size did not match expected size" )
    }

    const resolvedEtag = clientEtag
        ? normalizeETag( clientEtag )
        : head.ETag
            ? normalizeETag( head.ETag )
            : null
    const committed = await upsertCommittedFile( {
        userId: attempt.userId,
        providerId: attempt.providerId,
        objectKey: attempt.upstreamObjectKey,
        contentType: attempt.contentType,
        mappedFolderId: attempt.mappedFolderId,
        fileName: deriveFileName( attempt.objectKey ),
        sizeInBytes: observedSize,
        etag: resolvedEtag,
        cacheControl: head.CacheControl ?? null,
        lastModified: head.LastModified ?? new Date(),
    } )

    await touchCheckSchedule( attempt.id, new Date(), LAZY_RECHECK_MS )
    await markUploaded( attempt.id, resolvedEtag )
    incrementReconciliationMetric( "headSuccess" )
    return committed
}

export async function finalizeUploadAttempt( userId: string, uploadId: string, clientEtag?: string ): Promise<CompletedUpload> {
    const attempt = await findAttempt( userId, uploadId )
    if ( !attempt ) throw new Error( "Upload attempt not found" )
    if ( attempt.status === "uploaded" ) {
        const existing = await findCommittedFile( userId, attempt.upstreamObjectKey )
        if ( !existing ) throw new Error( "Upload already completed but file record is missing" )
        return existing
    }
    if ( attempt.status !== "pending" ) throw new Error( `Upload cannot be completed from status ${attempt.status}` )
    const now = new Date()
    if ( now.getTime() > cutoffAt( attempt.expiresAt ).getTime() ) {
        await markFailed( attempt.id, "Upload expired and object missing", now )
        incrementReconciliationMetric( "failedAfterExpiry" )
        throw new Error( "Upload attempt expired and object is missing" )
    }
    const provider = await getProviderClientById( attempt.providerId )
    incrementReconciliationMetric( "headChecks" )
    try {
        const head = await sendWithProviderTimeout( ( abortSignal ) => provider.client.send( new HeadObjectCommand( {
            Bucket: provider.bucketName,
            Key: attempt.upstreamObjectKey,
        } ), { abortSignal } ) )
        return finalizeUploaded( attempt, head, clientEtag )
    } catch ( error ) {
        if ( isMissingObjectError( error ) ) {
            incrementReconciliationMetric( "headMissing" )
            await touchCheckSchedule( attempt.id, now, LAZY_RECHECK_MS )
            throw new Error( "Upload object is not yet available in provider storage" )
        }
        if ( error instanceof ProviderRequestTimeoutError ) {
            await touchCheckSchedule( attempt.id, now, LAZY_RECHECK_MS )
        }
        incrementReconciliationMetric( "headProviderErrors" )
        throw error
    }
}

export function isUploadExpiredMissingError( error: unknown ): boolean {
    if ( !( error instanceof Error ) ) return false
    return /expired and object is missing/i.test( error.message )
}
