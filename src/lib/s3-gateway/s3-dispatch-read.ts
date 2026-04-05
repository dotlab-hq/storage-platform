import { getObject, headObject, listObjectsV2 } from "@/lib/s3-gateway/s3-object-store"
import { getObjectTags, objectTaggingXml } from "@/lib/s3-gateway/s3-object-tagging"
import { getObjectVersionResponse, listObjectVersions } from "@/lib/s3-gateway/s3-versioning"
import { getBucketAclXml, getObjectAclXml } from "@/lib/s3-gateway/s3-acl"
import { resolveBucketByAccessKey, resolveBucketByName, parseAccessKeyId } from "@/lib/s3-gateway/s3-context"
import { getBucketCors, getBucketLocation, getBucketPolicy, getBucketVersioning, listMultipartParts, listMultipartUploads } from "@/lib/s3-gateway/s3-bucket-controls"
import { bucketCorsXml, bucketLocationXml, bucketVersioningXml, listMultipartUploadsXml, listPartsXml } from "@/lib/s3-gateway/s3-control-xml"
import { listObjectVersionsXml } from "@/lib/s3-gateway/s3-versioning-xml"
import { listBucketsXml, listObjectsV2Xml, listObjectsXml, s3ErrorResponse, xmlResponse } from "@/lib/s3-gateway/s3-xml"
import { listPrefix, listTypeIsV2, multipartUploadId } from "@/lib/s3-gateway/s3-request"
import { ensureAccess, resolveAuthorizedBucket } from "@/lib/s3-gateway/s3-dispatch-context"

export async function handleGet( request: Request, parsed: { bucketName: string | null, objectKey: string | null } ): Promise<Response> {
    if ( !parsed.bucketName ) {
        const accessKeyId = parseAccessKeyId( request )
        if ( !accessKeyId ) return s3ErrorResponse( 403, "AccessDenied", "Missing credentials", "/" )
        const bucket = await resolveBucketByAccessKey( accessKeyId )
        if ( !bucket ) return s3ErrorResponse( 403, "AccessDenied", "Invalid credentials", "/" )
        return xmlResponse( listBucketsXml( bucket.bucketName, bucket.createdAt ) )
    }

    const bucket = await resolveAuthorizedBucket( request, parsed.bucketName )
    if ( !bucket ) {
        const byName = await resolveBucketByName( parsed.bucketName )
        if ( !byName ) return s3ErrorResponse( 404, "NoSuchBucket", "The specified bucket does not exist", `/${parsed.bucketName}` )
        const allowedAnon = await ensureAccess( byName, request, parsed.objectKey ? "s3:GetObject" : "s3:ListBucket", parsed.objectKey )
        if ( !allowedAnon ) return s3ErrorResponse( 403, "AccessDenied", "Access denied", `/${parsed.bucketName}` )
    }
    const resolvedBucket = bucket ?? await resolveBucketByName( parsed.bucketName )
    if ( !resolvedBucket ) return s3ErrorResponse( 404, "NoSuchBucket", "The specified bucket does not exist", `/${parsed.bucketName}` )

    if ( !parsed.objectKey ) {
        const url = new URL( request.url )
        const allowBucket = await ensureAccess( resolvedBucket, request, "s3:ListBucket", null )
        if ( !allowBucket ) return s3ErrorResponse( 403, "AccessDenied", "Access denied", `/${resolvedBucket.bucketName}` )
        if ( url.searchParams.has( "location" ) ) return xmlResponse( bucketLocationXml( await getBucketLocation( resolvedBucket.bucketId ) ) )
        if ( url.searchParams.has( "versioning" ) ) return xmlResponse( bucketVersioningXml( await getBucketVersioning( resolvedBucket.bucketId ) ) )
        if ( url.searchParams.has( "acl" ) ) return xmlResponse( await getBucketAclXml( resolvedBucket ) )
        if ( url.searchParams.has( "policy" ) ) {
            const policy = await getBucketPolicy( resolvedBucket.bucketId )
            if ( !policy ) return s3ErrorResponse( 404, "NoSuchBucketPolicy", "The bucket policy does not exist", `/${resolvedBucket.bucketName}` )
            return new Response( policy.policyJson, { status: 200, headers: { "Content-Type": "application/json" } } )
        }
        if ( url.searchParams.has( "cors" ) ) {
            const rules = await getBucketCors( resolvedBucket.bucketId )
            if ( rules.length === 0 ) return s3ErrorResponse( 404, "NoSuchCORSConfiguration", "The CORS configuration does not exist", `/${resolvedBucket.bucketName}` )
            return xmlResponse( bucketCorsXml( rules ) )
        }
        if ( url.searchParams.has( "uploads" ) ) return xmlResponse( listMultipartUploadsXml( resolvedBucket.bucketName, await listMultipartUploads( resolvedBucket ) ) )
        if ( url.searchParams.has( "versions" ) ) return xmlResponse( listObjectVersionsXml( resolvedBucket.bucketName, await listObjectVersions( resolvedBucket.bucketId ) ) )
        const prefix = listPrefix( request.url )
        const objects = await listObjectsV2( resolvedBucket, prefix )
        if ( !listTypeIsV2( request.url ) ) {
            const marker = url.searchParams.get( "marker" ) ?? ""
            return xmlResponse( listObjectsXml( resolvedBucket.bucketName, prefix, marker, objects ) )
        }
        return xmlResponse( listObjectsV2Xml( resolvedBucket.bucketName, prefix, objects ) )
    }

    if ( multipartUploadId( request.url ) ) {
        const uploadId = multipartUploadId( request.url )
        if ( !uploadId ) return s3ErrorResponse( 400, "InvalidRequest", "Missing uploadId", `/${resolvedBucket.bucketName}/${parsed.objectKey}` )
        const allowed = await ensureAccess( resolvedBucket, request, "s3:GetObject", parsed.objectKey )
        if ( !allowed ) return s3ErrorResponse( 403, "AccessDenied", "Access denied", `/${resolvedBucket.bucketName}/${parsed.objectKey}` )
        return xmlResponse( listPartsXml( resolvedBucket.bucketName, parsed.objectKey, uploadId, await listMultipartParts( resolvedBucket, uploadId ) ) )
    }

    const query = new URL( request.url ).searchParams
    if ( query.has( "tagging" ) ) return xmlResponse( objectTaggingXml( await getObjectTags( resolvedBucket, parsed.objectKey ) ) )
    if ( query.has( "acl" ) ) return xmlResponse( await getObjectAclXml( resolvedBucket, parsed.objectKey ) )

    const versionId = query.get( "versionId" )
    if ( versionId ) {
        const versioned = await getObjectVersionResponse( resolvedBucket, parsed.objectKey, versionId, false )
        if ( !versioned ) return s3ErrorResponse( 404, "NoSuchVersion", "The specified version does not exist", `/${resolvedBucket.bucketName}/${parsed.objectKey}` )
        return versioned
    }

    const allowed = await ensureAccess( resolvedBucket, request, "s3:GetObject", parsed.objectKey )
    if ( !allowed ) return s3ErrorResponse( 403, "AccessDenied", "Access denied", `/${resolvedBucket.bucketName}/${parsed.objectKey}` )
    const object = await getObject( resolvedBucket, parsed.objectKey, {
        ifNoneMatch: request.headers.get( "if-none-match" ),
        ifModifiedSince: request.headers.get( "if-modified-since" ),
    } )
    return object ?? s3ErrorResponse( 404, "NoSuchKey", "The specified key does not exist", `/${resolvedBucket.bucketName}/${parsed.objectKey}` )
}

export async function handleHead( request: Request, parsed: { bucketName: string | null, objectKey: string | null } ): Promise<Response> {
    if ( !parsed.bucketName ) return new Response( null, { status: 400 } )
    const bucket = await resolveAuthorizedBucket( request, parsed.bucketName ) ?? await resolveBucketByName( parsed.bucketName )
    if ( !bucket ) return new Response( null, { status: 403 } )
    if ( !parsed.objectKey ) return new Response( null, { status: 200 } )

    const versionId = new URL( request.url ).searchParams.get( "versionId" )
    if ( versionId ) return ( await getObjectVersionResponse( bucket, parsed.objectKey, versionId, true ) ) ?? new Response( null, { status: 404 } )

    const allowed = await ensureAccess( bucket, request, "s3:GetObject", parsed.objectKey )
    if ( !allowed ) return new Response( null, { status: 403 } )
    return ( await headObject( bucket, parsed.objectKey, {
        ifNoneMatch: request.headers.get( "if-none-match" ),
        ifModifiedSince: request.headers.get( "if-modified-since" ),
    } ) ) ?? new Response( null, { status: 404 } )
}
