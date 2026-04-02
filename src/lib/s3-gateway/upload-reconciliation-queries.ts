import { db } from "@/db"
import { uploadAttempt, virtualBucket } from "@/db/schema/s3-gateway"
import { and, asc, desc, eq, isNull, lte, or } from "drizzle-orm"
import type { AttemptRow } from "./upload-reconciliation-types"

export async function findAttempt( userId: string, uploadId: string ): Promise<AttemptRow | null> {
    const rows = await db
        .select( {
            id: uploadAttempt.id,
            userId: uploadAttempt.userId,
            providerId: uploadAttempt.providerId,
            objectKey: uploadAttempt.objectKey,
            upstreamObjectKey: uploadAttempt.upstreamObjectKey,
            expectedSize: uploadAttempt.expectedSize,
            contentType: uploadAttempt.contentType,
            status: uploadAttempt.status,
            expiresAt: uploadAttempt.expiresAt,
            createdAt: uploadAttempt.createdAt,
            completedAt: uploadAttempt.completedAt,
            errorMessage: uploadAttempt.errorMessage,
            lastCheckedAt: uploadAttempt.lastCheckedAt,
            nextCheckAfter: uploadAttempt.nextCheckAfter,
            mappedFolderId: virtualBucket.mappedFolderId,
        } )
        .from( uploadAttempt )
        .innerJoin( virtualBucket, eq( uploadAttempt.bucketId, virtualBucket.id ) )
        .where( and( eq( uploadAttempt.id, uploadId ), eq( uploadAttempt.userId, userId ) ) )
        .limit( 1 )
    return rows[0] ?? null
}

export async function touchCheckSchedule( attemptId: string, now: Date, recheckMs: number ): Promise<void> {
    await db
        .update( uploadAttempt )
        .set( {
            lastCheckedAt: now,
            nextCheckAfter: new Date( now.getTime() + recheckMs ),
        } )
        .where( eq( uploadAttempt.id, attemptId ) )
}

export async function markFailed( attemptId: string, errorMessage: string, now: Date ): Promise<void> {
    await db
        .update( uploadAttempt )
        .set( {
            status: "failed",
            errorMessage,
            lastCheckedAt: now,
            nextCheckAfter: null,
        } )
        .where( eq( uploadAttempt.id, attemptId ) )
}

export async function markUploaded( attemptId: string, eTag: string | null ): Promise<void> {
    await db
        .update( uploadAttempt )
        .set( {
            status: "uploaded",
            etag: eTag,
            completedAt: new Date(),
            errorMessage: null,
            nextCheckAfter: null,
        } )
        .where( eq( uploadAttempt.id, attemptId ) )
}

export async function findUploadAttemptByObjectKey( userId: string, bucketId: string, objectKey: string ): Promise<AttemptRow | null> {
    const rows = await db
        .select( {
            id: uploadAttempt.id,
            userId: uploadAttempt.userId,
            providerId: uploadAttempt.providerId,
            objectKey: uploadAttempt.objectKey,
            upstreamObjectKey: uploadAttempt.upstreamObjectKey,
            expectedSize: uploadAttempt.expectedSize,
            contentType: uploadAttempt.contentType,
            status: uploadAttempt.status,
            expiresAt: uploadAttempt.expiresAt,
            createdAt: uploadAttempt.createdAt,
            completedAt: uploadAttempt.completedAt,
            errorMessage: uploadAttempt.errorMessage,
            lastCheckedAt: uploadAttempt.lastCheckedAt,
            nextCheckAfter: uploadAttempt.nextCheckAfter,
            mappedFolderId: virtualBucket.mappedFolderId,
        } )
        .from( uploadAttempt )
        .innerJoin( virtualBucket, eq( uploadAttempt.bucketId, virtualBucket.id ) )
        .where(
            and(
                eq( uploadAttempt.userId, userId ),
                eq( uploadAttempt.bucketId, bucketId ),
                eq( uploadAttempt.objectKey, objectKey ),
            ),
        )
        .orderBy( desc( uploadAttempt.createdAt ) )
        .limit( 1 )
    return rows[0] ?? null
}

export async function listExpiredPendingAttemptRefs( cutoff: Date, now: Date, limit: number ): Promise<Array<{ id: string; userId: string }>> {
    return db
        .select( { id: uploadAttempt.id, userId: uploadAttempt.userId } )
        .from( uploadAttempt )
        .where(
            and(
                eq( uploadAttempt.status, "pending" ),
                lte( uploadAttempt.expiresAt, cutoff ),
                or( isNull( uploadAttempt.nextCheckAfter ), lte( uploadAttempt.nextCheckAfter, now ) ),
            ),
        )
        .orderBy( asc( uploadAttempt.expiresAt ) )
        .limit( limit )
}
