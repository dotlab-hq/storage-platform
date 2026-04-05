import { abortMultipartUpload, completeMultipartUpload, createMultipartUpload } from "@/lib/s3-gateway/s3-multipart"
import { deleteObject } from "@/lib/s3-gateway/s3-object-store"
import { parseCompleteMultipartUploadParts } from "@/lib/s3-gateway/s3-multipart-complete-parser"
import { createDeleteMarkerVersion, getBucketVersioningState } from "@/lib/s3-gateway/s3-versioning"
import { deleteVirtualBucket } from "@/lib/s3-gateway/virtual-buckets"
import { deleteBucketPolicy, replaceBucketCors } from "@/lib/s3-gateway/s3-bucket-controls"
import { deleteObjectTags } from "@/lib/s3-gateway/s3-object-tagging"
import { multipartUploadId, hasMultipartCreateFlag } from "@/lib/s3-gateway/s3-request"
import { completeMultipartUploadXml, createMultipartUploadXml, s3ErrorResponse, xmlResponse } from "@/lib/s3-gateway/s3-xml"
import { resolveAuthorizedBucket } from "@/lib/s3-gateway/s3-dispatch-context"

export async function handleDelete( request: Request, parsed: { bucketName: string | null, objectKey: string | null } ): Promise<Response> {
    if ( !parsed.bucketName ) return new Response( null, { status: 400 } )
    const bucket = await resolveAuthorizedBucket( request, parsed.bucketName )
    if ( !bucket ) return new Response( null, { status: 403 } )

    if ( !parsed.objectKey ) {
        const url = new URL( request.url )
        if ( url.searchParams.has( "policy" ) ) {
            await deleteBucketPolicy( bucket.bucketId )
            return new Response( null, { status: 204 } )
        }
        if ( url.searchParams.has( "cors" ) ) {
            await replaceBucketCors( bucket.bucketId, [] )
            return new Response( null, { status: 204 } )
        }
        await deleteVirtualBucket( bucket.userId, bucket.bucketName )
        return new Response( null, { status: 204 } )
    }

    const uploadId = multipartUploadId( request.url )
    if ( uploadId ) {
        await abortMultipartUpload( bucket, uploadId )
        return new Response( null, { status: 204 } )
    }

    if ( new URL( request.url ).searchParams.has( "tagging" ) ) {
        await deleteObjectTags( bucket, parsed.objectKey )
        return new Response( null, { status: 204 } )
    }

    if ( await getBucketVersioningState( bucket.bucketId ) === "enabled" ) {
        const markerVersionId = await createDeleteMarkerVersion( bucket, parsed.objectKey )
        return new Response( null, { status: 204, headers: { "x-amz-version-id": markerVersionId } } )
    }

    await deleteObject( bucket, parsed.objectKey )
    return new Response( null, { status: 204 } )
}

export async function handlePost( request: Request, parsed: { bucketName: string | null, objectKey: string | null } ): Promise<Response> {
    if ( !parsed.bucketName || !parsed.objectKey ) return s3ErrorResponse( 400, "InvalidRequest", "Bucket and key are required", "/" )
    const bucket = await resolveAuthorizedBucket( request, parsed.bucketName )
    if ( !bucket ) return s3ErrorResponse( 403, "AccessDenied", "Access denied", `/${parsed.bucketName}/${parsed.objectKey}` )

    if ( hasMultipartCreateFlag( request.url ) ) {
        const uploadId = await createMultipartUpload( bucket, parsed.objectKey, request.headers.get( "content-type" ) )
        return xmlResponse( createMultipartUploadXml( bucket.bucketName, parsed.objectKey, uploadId ) )
    }

    const uploadId = multipartUploadId( request.url )
    if ( uploadId ) {
        const eTag = await completeMultipartUpload( bucket, uploadId, parseCompleteMultipartUploadParts( await request.text() ) )
        return xmlResponse( completeMultipartUploadXml( bucket.bucketName, parsed.objectKey, eTag ) )
    }

    return s3ErrorResponse( 400, "InvalidRequest", "Unsupported POST operation", `/${parsed.bucketName}/${parsed.objectKey}` )
}
