import { getReconciliationMetrics, incrementReconciliationMetric } from "./upload-reconciliation-metrics"
import { findAttempt, listExpiredPendingAttemptRefs, touchCheckSchedule } from "./upload-reconciliation-queries"
import { finalizeUploadAttempt } from "./upload-reconciliation"
import type { UploadStatusResult } from "./upload-reconciliation-types"
import { ProviderRequestTimeoutError } from "./s3-provider-timeout"

const LAZY_RECHECK_MS = 10_000
const FAILURE_BUFFER_MS = 2 * 60 * 1000
const VERIFY_BATCH_LIMIT_DEFAULT = 100

function mapUploadStatus( status: string ): "uploading" | "ready" | "failed" {
    if ( status === "uploaded" ) return "ready"
    if ( status === "failed" ) return "failed"
    return "uploading"
}

export async function resolveUploadStatus( userId: string, uploadId: string ): Promise<UploadStatusResult> {
    const attempt = await findAttempt( userId, uploadId )
    if ( !attempt ) throw new Error( "Upload attempt not found" )
    if ( attempt.status !== "pending" ) {
        return {
            uploadId: attempt.id,
            status: mapUploadStatus( attempt.status ),
            internalStatus: attempt.status as "uploaded" | "failed",
            objectKey: attempt.objectKey,
            createdAt: attempt.createdAt,
            completedAt: attempt.completedAt,
            expiresAt: attempt.expiresAt,
            errorMessage: attempt.errorMessage,
            message: attempt.errorMessage,
        }
    }
    const now = new Date()
    if ( attempt.nextCheckAfter && attempt.nextCheckAfter.getTime() > now.getTime() ) {
        incrementReconciliationMetric( "debouncedChecks" )
        return {
            uploadId: attempt.id,
            status: "uploading",
            internalStatus: "pending",
            objectKey: attempt.objectKey,
            createdAt: attempt.createdAt,
            completedAt: attempt.completedAt,
            expiresAt: attempt.expiresAt,
            errorMessage: null,
            message: "Upload is still being processed",
        }
    }
    try {
        await finalizeUploadAttempt( userId, uploadId )
        return {
            uploadId: attempt.id,
            status: "ready",
            internalStatus: "uploaded",
            objectKey: attempt.objectKey,
            createdAt: attempt.createdAt,
            completedAt: new Date(),
            expiresAt: attempt.expiresAt,
            errorMessage: null,
            message: null,
        }
    } catch ( error ) {
        if ( error instanceof ProviderRequestTimeoutError ) {
            await touchCheckSchedule( attempt.id, now, LAZY_RECHECK_MS )
            return {
                uploadId: attempt.id,
                status: "uploading",
                internalStatus: "pending",
                objectKey: attempt.objectKey,
                createdAt: attempt.createdAt,
                completedAt: attempt.completedAt,
                expiresAt: attempt.expiresAt,
                errorMessage: null,
                message: "Provider check timed out; still uploading",
            }
        }
        const reloaded = await findAttempt( userId, uploadId )
        if ( reloaded?.status === "failed" ) {
            return {
                uploadId: reloaded.id,
                status: "failed",
                internalStatus: "failed",
                objectKey: reloaded.objectKey,
                createdAt: reloaded.createdAt,
                completedAt: reloaded.completedAt,
                expiresAt: reloaded.expiresAt,
                errorMessage: reloaded.errorMessage,
                message: reloaded.errorMessage,
            }
        }
        await touchCheckSchedule( attempt.id, now, LAZY_RECHECK_MS )
        return {
            uploadId: attempt.id,
            status: "uploading",
            internalStatus: "pending",
            objectKey: attempt.objectKey,
            createdAt: attempt.createdAt,
            completedAt: attempt.completedAt,
            expiresAt: attempt.expiresAt,
            errorMessage: null,
            message: "Upload is still in progress",
        }
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
