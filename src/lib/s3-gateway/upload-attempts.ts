import { db } from "@/db"
import { uploadAttempt, virtualBucket } from "@/db/schema/s3-gateway"
import { getProviderClientById, selectProviderForUpload } from "@/lib/s3-provider-client"
import { and, eq } from "drizzle-orm"
import { findCommittedFile, upsertCommittedFile } from "./upload-file-records"
import { buildUpstreamObjectKey, deriveFileName } from "./upload-key-utils"
import { normalizeETag } from "./s3-conditional-cache"

type InitiateUploadInput = {
    userId: string
    bucketName: string
    objectKey: string
    fileSize: number
    contentType: string
}

export async function initiateUpload( input: InitiateUploadInput ) {
    const bucketRows = await db
        .select( {
            id: virtualBucket.id,
            mappedFolderId: virtualBucket.mappedFolderId,
        } )
        .from( virtualBucket )
        .where( and( eq( virtualBucket.userId, input.userId ), eq( virtualBucket.name, input.bucketName ), eq( virtualBucket.isActive, true ) ) )
        .limit( 1 )

    if ( bucketRows.length === 0 ) {
        throw new Error( "Bucket not found" )
    }

    const bucket = bucketRows[0]
    const provider = await selectProviderForUpload( input.fileSize )
    const attemptId = crypto.randomUUID()
    const expiresAt = new Date( Date.now() + 15 * 60 * 1000 )
    const upstreamObjectKey = buildUpstreamObjectKey( input.userId, bucket.id, input.objectKey )

    await db.insert( uploadAttempt ).values( {
        id: attemptId,
        userId: input.userId,
        bucketId: bucket.id,
        providerId: provider.providerId,
        objectKey: input.objectKey,
        upstreamObjectKey,
        expectedSize: input.fileSize,
        contentType: input.contentType,
        status: "pending",
        expiresAt,
    } )

    const { PutObjectCommand } = await import( "@aws-sdk/client-s3" )
    const { getSignedUrl } = await import( "@aws-sdk/s3-request-presigner" )

    const command = new PutObjectCommand( {
        Bucket: provider.bucketName,
        Key: upstreamObjectKey,
        ContentType: input.contentType,
        Metadata: {
            "upload-id": attemptId,
            "source-bucket": input.bucketName,
        },
    } )

    const presignedUrl = await getSignedUrl( provider.client, command, { expiresIn: 900 } )

    return {
        uploadId: attemptId,
        providerId: provider.providerId,
        bucketId: bucket.id,
        mappedFolderId: bucket.mappedFolderId,
        presignedUrl,
        expiresAt: expiresAt.toISOString(),
        headers: {
            "Content-Type": input.contentType,
            "x-amz-meta-upload-id": attemptId,
            "x-amz-meta-source-bucket": input.bucketName,
        },
    }
}

export async function completeUpload( userId: string, uploadId: string, clientEtag?: string ) {
    const attemptRows = await db
        .select( {
            id: uploadAttempt.id,
            bucketId: uploadAttempt.bucketId,
            providerId: uploadAttempt.providerId,
            objectKey: uploadAttempt.objectKey,
            upstreamObjectKey: uploadAttempt.upstreamObjectKey,
            expectedSize: uploadAttempt.expectedSize,
            contentType: uploadAttempt.contentType,
            status: uploadAttempt.status,
            expiresAt: uploadAttempt.expiresAt,
            mappedFolderId: virtualBucket.mappedFolderId,
        } )
        .from( uploadAttempt )
        .innerJoin( virtualBucket, eq( uploadAttempt.bucketId, virtualBucket.id ) )
        .where( and( eq( uploadAttempt.id, uploadId ), eq( uploadAttempt.userId, userId ) ) )
        .limit( 1 )

    if ( attemptRows.length === 0 ) {
        throw new Error( "Upload attempt not found" )
    }

    const attempt = attemptRows[0]
    if ( attempt.status === "uploaded" ) {
        const existing = await findCommittedFile( userId, attempt.upstreamObjectKey )
        if ( !existing ) {
            throw new Error( "Upload already completed but file record is missing" )
        }
        return existing
    }

    if ( attempt.status !== "pending" ) {
        throw new Error( `Upload cannot be completed from status ${attempt.status}` )
    }

    if ( attempt.expiresAt.getTime() < Date.now() ) {
        await db.update( uploadAttempt ).set( { status: "failed", errorMessage: "Upload expired" } ).where( eq( uploadAttempt.id, uploadId ) )
        throw new Error( "Upload attempt expired" )
    }

    const provider = await getProviderClientById( attempt.providerId ?? null )
    const { HeadObjectCommand } = await import( "@aws-sdk/client-s3" )
    const head = await provider.client.send( new HeadObjectCommand( {
        Bucket: provider.bucketName,
        Key: attempt.upstreamObjectKey,
    } ) )

    const observedSize = Number( head.ContentLength ?? 0 )
    if ( observedSize !== attempt.expectedSize ) {
        await db.update( uploadAttempt ).set( { status: "failed", errorMessage: "Uploaded size mismatch" } ).where( eq( uploadAttempt.id, uploadId ) )
        throw new Error( "Uploaded object size did not match expected size" )
    }

    const completedUploadEtag = clientEtag
        ? normalizeETag( clientEtag )
        : head.ETag
            ? normalizeETag( head.ETag )
            : null
    const committed = await upsertCommittedFile( {
        userId,
        providerId: attempt.providerId,
        objectKey: attempt.upstreamObjectKey,
        contentType: attempt.contentType,
        mappedFolderId: attempt.mappedFolderId,
        fileName: deriveFileName( attempt.objectKey ),
        sizeInBytes: observedSize,
        etag: completedUploadEtag,
        cacheControl: head.CacheControl ?? null,
        lastModified: head.LastModified ?? new Date(),
    } )

    await db
        .update( uploadAttempt )
        .set( {
            status: "uploaded",
            etag: completedUploadEtag,
            completedAt: new Date(),
            errorMessage: null,
        } )
        .where( eq( uploadAttempt.id, uploadId ) )

    return committed
}

export async function getUploadStatus( userId: string, uploadId: string ) {
    const rows = await db
        .select( {
            status: uploadAttempt.status,
            errorMessage: uploadAttempt.errorMessage,
            createdAt: uploadAttempt.createdAt,
            completedAt: uploadAttempt.completedAt,
            expiresAt: uploadAttempt.expiresAt,
            objectKey: uploadAttempt.objectKey,
        } )
        .from( uploadAttempt )
        .where( and( eq( uploadAttempt.id, uploadId ), eq( uploadAttempt.userId, userId ) ) )
        .limit( 1 )

    if ( rows.length === 0 ) {
        throw new Error( "Upload attempt not found" )
    }

    return rows[0]
}
