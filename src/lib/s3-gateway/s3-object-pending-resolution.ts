import type { BucketContext } from "@/lib/s3-gateway/s3-context"
import type { ObjectConditionalHeaders } from "@/lib/s3-gateway/s3-conditional-cache"
import { findUploadAttemptByObjectKey } from "./upload-reconciliation-queries"
import { finalizeUploadAttempt, isUploadExpiredMissingError } from "./upload-reconciliation"

export async function resolvePendingGetObject( bucket: BucketContext, objectKey: string, conditionals: ObjectConditionalHeaders, resolver: ( bucket: BucketContext, objectKey: string, conditionals: ObjectConditionalHeaders ) => Promise<Response | null> ): Promise<Response | null> {
    const attempt = await findUploadAttemptByObjectKey( bucket.userId, bucket.bucketId, objectKey )
    if ( attempt?.status === "pending" ) {
        try {
            await finalizeUploadAttempt( bucket.userId, attempt.id )
        } catch ( error ) {
            if ( !isUploadExpiredMissingError( error ) ) {
                return new Response( JSON.stringify( { status: "uploading", message: "Upload is still processing" } ), {
                    status: 202,
                    headers: { "Content-Type": "application/json" },
                } )
            }
            return null
        }
        return resolver( bucket, objectKey, conditionals )
    }
    if ( attempt?.status === "failed" ) {
        return null
    }
    return null
}

export async function resolvePendingHeadObject( bucket: BucketContext, objectKey: string, conditionals: ObjectConditionalHeaders, resolver: ( bucket: BucketContext, objectKey: string, conditionals: ObjectConditionalHeaders ) => Promise<Response | null> ): Promise<Response | null> {
    const attempt = await findUploadAttemptByObjectKey( bucket.userId, bucket.bucketId, objectKey )
    if ( attempt?.status === "pending" ) {
        try {
            await finalizeUploadAttempt( bucket.userId, attempt.id )
        } catch ( error ) {
            if ( !isUploadExpiredMissingError( error ) ) return new Response( null, { status: 202 } )
            return null
        }
        return resolver( bucket, objectKey, conditionals )
    }
    return null
}
