import { HeadObjectCommand, type HeadObjectCommandOutput } from "@aws-sdk/client-s3"
import { getProviderClientById } from "@/lib/s3-provider-client"
import { normalizeETag } from "./s3-conditional-cache"
import { getReconciliationMetrics, incrementReconciliationMetric } from "./upload-reconciliation-metrics"
import { findAttempt, listExpiredPendingAttemptRefs, markFailed, markUploaded, touchCheckSchedule } from "./upload-reconciliation-queries"
import type { UploadStatusResult, AttemptRow } from "./upload-reconciliation-types"
import { ProviderRequestTimeoutError, sendWithProviderTimeout } from "./s3-provider-timeout"
import { type CompletedUpload, findCommittedFile, upsertCommittedFile } from "./upload-file-records"
import { deriveFileName } from "./upload-key-utils"

const LAZY_RECHECK_MS = 10_000
const FAILURE_BUFFER_MS = 2 * 60 * 1000
const VERIFY_BATCH_LIMIT_DEFAULT = 100

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
        incrementReconciliationMetric( "headProviderErrors" )
        throw error
    }
}

function mapUploadStatus( status: string ): "uploading" | "ready" | "failed" {
    if ( status === "uploaded" ) return "ready"
    if ( status === "failed" ) return "failed"
    return "uploading"
}

export async function resolveUploadStatus( userId: string, uploadId: string ): Promise<UploadStatusResult> {
    const attempt = await findAttempt( userId, uploadId )
    if ( !attempt ) throw new Error( "Upload attempt not found" )
    if ( attempt.status !== "pending" ) {
        return { uploadId: attempt.id, status: mapUploadStatus( attempt.status ), internalStatus: attempt.status as "uploaded" | "failed", objectKey: attempt.objectKey, createdAt: attempt.createdAt, completedAt: attempt.completedAt, expiresAt: attempt.expiresAt, errorMessage: attempt.errorMessage, message: attempt.errorMessage }
    }
    const now = new Date()
    if ( attempt.nextCheckAfter && attempt.nextCheckAfter.getTime() > now.getTime() ) {
        incrementReconciliationMetric( "debouncedChecks" )
        return { uploadId: attempt.id, status: "uploading", internalStatus: "pending", objectKey: attempt.objectKey, createdAt: attempt.createdAt, completedAt: attempt.completedAt, expiresAt: attempt.expiresAt, errorMessage: null, message: "Upload is still being processed" }
    }
    try {
        await finalizeUploadAttempt( userId, uploadId )
        return { uploadId: attempt.id, status: "ready", internalStatus: "uploaded", objectKey: attempt.objectKey, createdAt: attempt.createdAt, completedAt: new Date(), expiresAt: attempt.expiresAt, errorMessage: null, message: null }
    } catch ( error ) {
        if ( error instanceof ProviderRequestTimeoutError ) {
            await touchCheckSchedule( attempt.id, now, LAZY_RECHECK_MS )
            return { uploadId: attempt.id, status: "uploading", internalStatus: "pending", objectKey: attempt.objectKey, createdAt: attempt.createdAt, completedAt: attempt.completedAt, expiresAt: attempt.expiresAt, errorMessage: null, message: "Provider check timed out; still uploading" }
        }
        const reloaded = await findAttempt( userId, uploadId )
        if ( reloaded?.status === "failed" ) {
            return { uploadId: reloaded.id, status: "failed", internalStatus: "failed", objectKey: reloaded.objectKey, createdAt: reloaded.createdAt, completedAt: reloaded.completedAt, expiresAt: reloaded.expiresAt, errorMessage: reloaded.errorMessage, message: reloaded.errorMessage }
        }
        await touchCheckSchedule( attempt.id, now, LAZY_RECHECK_MS )
        return { uploadId: attempt.id, status: "uploading", internalStatus: "pending", objectKey: attempt.objectKey, createdAt: attempt.createdAt, completedAt: attempt.completedAt, expiresAt: attempt.expiresAt, errorMessage: null, message: "Upload is still in progress" }
    }
}

type VerifySummary = {
    scanned: number
    ready: number
    failed: number
    deferred: number
    metrics: ReturnType<typeof getReconciliationMetrics>
}

export async function verifyExpiredPendingUploads( limit = VERIFY_BATCH_LIMIT_DEFAULT ): Promise<VerifySummary> {
    const now = new Date()
    const cutoff = new Date( now.getTime() - FAILURE_BUFFER_MS )
    const refs = await listExpiredPendingAttemptRefs( cutoff, now, limit )
    let ready = 0
    let failed = 0
    let deferred = 0
    for ( const ref of refs ) {
        try {
            await finalizeUploadAttempt( ref.userId, ref.id )
            ready += 1
        } catch {
            const current = await findAttempt( ref.userId, ref.id )
            if ( current?.status === "failed" ) failed += 1
            else deferred += 1
        }
    }
    return { scanned: refs.length, ready, failed, deferred, metrics: getReconciliationMetrics() }
}
