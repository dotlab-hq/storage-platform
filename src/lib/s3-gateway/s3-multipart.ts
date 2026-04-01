import { PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3"
import { db } from "@/db"
import { uploadAttempt } from "@/db/schema/s3-gateway"
import type { BucketContext } from "@/lib/s3-gateway/s3-context"
import { getProviderClientById, selectProviderForUpload } from "@/lib/s3-provider-client"
import { and, eq } from "drizzle-orm"
import { upsertCommittedFile } from "./upload-file-records"
import { buildUpstreamObjectKey, deriveFileName } from "./upload-key-utils"

const MULTIPART_UPLOAD_EXPIRY_MS = 60 * 60 * 1000

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
    body: Uint8Array,
    contentType: string | null,
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
    const result = await provider.client.send( new PutObjectCommand( {
        Bucket: provider.bucketName,
        Key: attempt.upstreamObjectKey,
        Body: body,
        ContentType: contentType ?? "application/octet-stream",
    } ) )

    await db
        .update( uploadAttempt )
        .set( {
            objectKey,
            expectedSize: body.byteLength,
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
    const head = await provider.client.send( new HeadObjectCommand( {
        Bucket: provider.bucketName,
        Key: attempt.upstreamObjectKey,
    } ) )

    const observedSize = Number( head.ContentLength ?? 0 )
    const eTag = head.ETag ?? attempt.etag ?? ""

    await upsertCommittedFile( {
        userId: bucket.userId,
        providerId: attempt.providerId,
        objectKey: attempt.upstreamObjectKey,
        contentType: attempt.contentType,
        mappedFolderId: bucket.mappedFolderId,
        fileName: deriveFileName( attempt.objectKey ),
        sizeInBytes: observedSize,
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
