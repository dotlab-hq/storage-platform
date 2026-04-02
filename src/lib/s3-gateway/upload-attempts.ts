import { db } from "@/db"
import { uploadAttempt, virtualBucket } from "@/db/schema/s3-gateway"
import { selectProviderForUpload } from "@/lib/s3-provider-client"
import { and, eq } from "drizzle-orm"
import { buildUpstreamObjectKey } from "./upload-key-utils"
import { finalizeUploadAttempt, resolveUploadStatus } from "./upload-reconciliation"

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
        lastCheckedAt: null,
        nextCheckAfter: null,
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
    return finalizeUploadAttempt( userId, uploadId, clientEtag )
}

export async function getUploadStatus( userId: string, uploadId: string ) {
    return resolveUploadStatus( userId, uploadId )
}
