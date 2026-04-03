import type { BucketContext } from "@/lib/s3-gateway/s3-context"
import { parseAccessKeyId, resolveBucketByAccessKey, resolveBucketByName, isSecretValid } from "@/lib/s3-gateway/s3-context"
import { abortMultipartUpload, completeMultipartUpload, createMultipartUpload, uploadPart } from "@/lib/s3-gateway/s3-multipart"
import { deleteObject, getObject, headObject, listObjectsV2, putObject } from "@/lib/s3-gateway/s3-object-store"
import { hasMultipartCreateFlag, listPrefix, listTypeIsV2, multipartPartNumber, multipartUploadId, parseS3Path } from "@/lib/s3-gateway/s3-request"
import { ProviderRequestTimeoutError } from "@/lib/s3-gateway/s3-provider-timeout"
import { completeMultipartUploadXml, createMultipartUploadXml, listBucketsXml, listObjectsV2Xml, s3ErrorResponse, xmlResponse } from "@/lib/s3-gateway/s3-xml"

type ErrorWithMetadata = {
    $metadata?: {
        httpStatusCode?: number
    }
}

const UPLOAD_MAX_ATTEMPTS = ( () => {
    const raw = process.env.S3_UPLOAD_MAX_ATTEMPTS
    if ( !raw ) return 3
    const parsed = Number.parseInt( raw, 10 )
    if ( !Number.isFinite( parsed ) || parsed < 1 ) return 3
    return parsed
} )()

function providerHttpStatusCode( error: unknown ): number | null {
    if ( !error || typeof error !== "object" ) {
        return null
    }
    const metadata = ( error as ErrorWithMetadata ).$metadata
    if ( !metadata || typeof metadata.httpStatusCode !== "number" ) {
        return null
    }
    return metadata.httpStatusCode
}

function mapProviderStatusToS3Error( statusCode: number ): { status: number, code: string, message: string } {
    if ( statusCode === 400 ) return { status: 400, code: "InvalidRequest", message: "The request sent to the upstream storage provider was invalid" }
    if ( statusCode === 401 || statusCode === 403 ) return { status: 403, code: "AccessDenied", message: "Access denied by upstream storage provider" }
    if ( statusCode === 404 ) return { status: 404, code: "NoSuchKey", message: "The specified key does not exist" }
    if ( statusCode === 409 ) return { status: 409, code: "Conflict", message: "The request conflicts with the current state of the resource" }
    if ( statusCode === 413 ) return { status: 413, code: "EntityTooLarge", message: "Your proposed upload exceeds the maximum allowed object size" }
    if ( statusCode === 429 ) return { status: 503, code: "SlowDown", message: "Please reduce your request rate" }
    if ( statusCode >= 500 ) return { status: 503, code: "ServiceUnavailable", message: "Upstream storage provider is temporarily unavailable" }
    return { status: 502, code: "BadGateway", message: "Upstream storage provider request failed" }
}

function appendVary( headers: Headers, value: string ): void {
    const existing = headers.get( "Vary" )
    if ( !existing ) {
        headers.set( "Vary", value )
        return
    }
    const values = existing.split( "," ).map( ( item ) => item.trim().toLowerCase() )
    if ( !values.includes( value.toLowerCase() ) ) {
        headers.set( "Vary", `${existing}, ${value}` )
    }
}

function withCors( request: Request, response: Response ): Response {
    const origin = request.headers.get( "origin" )
    if ( !origin ) return response

    const headers = new Headers( response.headers )
    headers.set( "Access-Control-Allow-Origin", origin )
    headers.set( "Access-Control-Allow-Credentials", "true" )
    headers.set( "Access-Control-Allow-Methods", "GET,HEAD,PUT,POST,DELETE,OPTIONS" )
    headers.set(
        "Access-Control-Allow-Headers",
        request.headers.get( "access-control-request-headers" )
        ?? "Authorization,Content-Type,X-Amz-Date,X-Amz-Content-Sha256,X-Amz-Security-Token,X-Amz-User-Agent,X-S3-Secret-Access-Key",
    )
    headers.set( "Access-Control-Expose-Headers", "ETag,x-amz-request-id,x-amz-id-2" )
    headers.set( "Access-Control-Max-Age", "86400" )
    appendVary( headers, "Origin" )
    appendVary( headers, "Access-Control-Request-Headers" )

    return new Response( response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
    } )
}

function parseContentLength( request: Request ): number | null {
    const raw = request.headers.get( "content-length" )
    if ( !raw ) return null
    const parsed = Number.parseInt( raw, 10 )
    if ( !Number.isFinite( parsed ) || parsed < 0 ) return null
    return parsed
}

function buildUploadBodyAttempts( request: Request, maxAttempts: number ): ReadableStream<Uint8Array>[] {
    const bodyAttempts: ReadableStream<Uint8Array>[] = []
    for ( let index = 0; index < maxAttempts; index += 1 ) {
        const cloneBody = request.clone().body
        if ( cloneBody ) {
            bodyAttempts.push( cloneBody )
        }
    }
    return bodyAttempts
}

async function resolveAuthorizedBucket( request: Request, bucketName: string | null ): Promise<BucketContext | null> {
    const accessKeyId = parseAccessKeyId( request )
    if ( !accessKeyId ) return null
    const byAccessKey = await resolveBucketByAccessKey( accessKeyId )
    if ( !byAccessKey ) return null
    const candidateBucket = bucketName ? await resolveBucketByName( bucketName ) : byAccessKey
    if ( !candidateBucket ) return null
    const authorization = request.headers.get( "authorization" )
    if ( !authorization ) return candidateBucket
    const providedSecret = request.headers.get( "x-s3-secret-access-key" )
    if ( providedSecret && !isSecretValid( candidateBucket, providedSecret ) ) return null
    return candidateBucket
}

async function handleGet( request: Request ): Promise<Response> {
    const parsed = parseS3Path( request.url )
    if ( !parsed.bucketName ) {
        const accessKeyId = parseAccessKeyId( request )
        if ( !accessKeyId ) return s3ErrorResponse( 403, "AccessDenied", "Missing credentials", "/" )
        const bucket = await resolveBucketByAccessKey( accessKeyId )
        if ( !bucket ) return s3ErrorResponse( 403, "AccessDenied", "Invalid credentials", "/" )
        return xmlResponse( listBucketsXml( bucket.bucketName, bucket.createdAt ) )
    }

    const bucket = await resolveAuthorizedBucket( request, parsed.bucketName )
    if ( !bucket ) return s3ErrorResponse( 403, "AccessDenied", "Access denied", `/${parsed.bucketName}` )

    if ( !parsed.objectKey ) {
        if ( !listTypeIsV2( request.url ) ) {
            return s3ErrorResponse( 400, "InvalidRequest", "Only list-type=2 is supported", `/${bucket.bucketName}` )
        }
        const prefix = listPrefix( request.url )
        const objects = await listObjectsV2( bucket, prefix )
        return xmlResponse( listObjectsV2Xml( bucket.bucketName, prefix, objects ) )
    }

    const object = await getObject( bucket, parsed.objectKey, {
        ifNoneMatch: request.headers.get( "if-none-match" ),
        ifModifiedSince: request.headers.get( "if-modified-since" ),
    } )
    if ( !object ) {
        return s3ErrorResponse( 404, "NoSuchKey", "The specified key does not exist", `/${bucket.bucketName}/${parsed.objectKey}` )
    }
    return object
}

async function handleHead( request: Request ): Promise<Response> {
    const parsed = parseS3Path( request.url )
    if ( !parsed.bucketName ) return new Response( null, { status: 400 } )
    const bucket = await resolveAuthorizedBucket( request, parsed.bucketName )
    if ( !bucket ) return new Response( null, { status: 403 } )
    if ( !parsed.objectKey ) return new Response( null, { status: 200 } )
    return ( await headObject( bucket, parsed.objectKey, {
        ifNoneMatch: request.headers.get( "if-none-match" ),
        ifModifiedSince: request.headers.get( "if-modified-since" ),
    } ) ) ?? new Response( null, { status: 404 } )
}

async function handlePut( request: Request ): Promise<Response> {
    const parsed = parseS3Path( request.url )
    if ( !parsed.bucketName || !parsed.objectKey ) return s3ErrorResponse( 400, "InvalidRequest", "Bucket and key are required", "/" )
    const bucket = await resolveAuthorizedBucket( request, parsed.bucketName )
    if ( !bucket ) return s3ErrorResponse( 403, "AccessDenied", "Access denied", `/${parsed.bucketName}/${parsed.objectKey}` )

    const bodyAttempts = buildUploadBodyAttempts( request, UPLOAD_MAX_ATTEMPTS )
    if ( bodyAttempts.length === 0 ) {
        return s3ErrorResponse( 400, "InvalidRequest", "Request body stream is required", `/${parsed.bucketName}/${parsed.objectKey}` )
    }
    const contentLength = parseContentLength( request )
    const contentType = request.headers.get( "content-type" )
    const uploadId = multipartUploadId( request.url )
    const partNumber = multipartPartNumber( request.url )
    const eTag = uploadId && partNumber
        ? await uploadPart( bucket, parsed.objectKey, uploadId, bodyAttempts, contentType, contentLength )
        : await putObject( bucket, parsed.objectKey, bodyAttempts, contentType, contentLength )
    return new Response( null, { status: 200, headers: { ETag: eTag ?? "" } } )
}

async function handleDelete( request: Request ): Promise<Response> {
    const parsed = parseS3Path( request.url )
    if ( !parsed.bucketName ) return new Response( null, { status: 400 } )
    const bucket = await resolveAuthorizedBucket( request, parsed.bucketName )
    if ( !bucket ) return new Response( null, { status: 403 } )

    const uploadId = multipartUploadId( request.url )
    if ( uploadId ) {
        await abortMultipartUpload( bucket, uploadId )
        return new Response( null, { status: 204 } )
    }
    if ( !parsed.objectKey ) return new Response( null, { status: 400 } )
    await deleteObject( bucket, parsed.objectKey )
    return new Response( null, { status: 204 } )
}

async function handlePost( request: Request ): Promise<Response> {
    const parsed = parseS3Path( request.url )
    if ( !parsed.bucketName || !parsed.objectKey ) return s3ErrorResponse( 400, "InvalidRequest", "Bucket and key are required", "/" )
    const bucket = await resolveAuthorizedBucket( request, parsed.bucketName )
    if ( !bucket ) return s3ErrorResponse( 403, "AccessDenied", "Access denied", `/${parsed.bucketName}/${parsed.objectKey}` )

    if ( hasMultipartCreateFlag( request.url ) ) {
        const uploadId = await createMultipartUpload( bucket, parsed.objectKey, request.headers.get( "content-type" ) )
        return xmlResponse( createMultipartUploadXml( bucket.bucketName, parsed.objectKey, uploadId ) )
    }

    const uploadId = multipartUploadId( request.url )
    if ( uploadId ) {
        const eTag = await completeMultipartUpload( bucket, uploadId )
        return xmlResponse( completeMultipartUploadXml( bucket.bucketName, parsed.objectKey, eTag ) )
    }

    return s3ErrorResponse( 400, "InvalidRequest", "Unsupported POST operation", `/${parsed.bucketName}/${parsed.objectKey}` )
}

export async function handleS3Request( request: Request ): Promise<Response> {
    try {
        if ( request.method === "OPTIONS" ) {
            return withCors( request, new Response( null, { status: 204 } ) )
        }

        let response: Response
        if ( request.method === "GET" ) response = await handleGet( request )
        else if ( request.method === "HEAD" ) response = await handleHead( request )
        else if ( request.method === "PUT" ) response = await handlePut( request )
        else if ( request.method === "DELETE" ) response = await handleDelete( request )
        else if ( request.method === "POST" ) response = await handlePost( request )
        else {
            response = s3ErrorResponse( 405, "MethodNotAllowed", "The specified method is not allowed against this resource", new URL( request.url ).pathname )
        }

        return withCors( request, response )
    } catch ( error ) {
        const message = error instanceof Error
            ? `${error.name}: ${error.message}`
            : "Unknown server error"
        const resource = new URL( request.url ).pathname
        if ( error instanceof ProviderRequestTimeoutError ) {
            return withCors( request, s3ErrorResponse( 504, "RequestTimeout", message, resource ) )
        }
        if ( /Invalid or expired upload ID/i.test( message ) ) {
            return withCors( request, s3ErrorResponse( 404, "NoSuchUpload", message, resource ) )
        }
        const upstreamStatusCode = providerHttpStatusCode( error )
        if ( upstreamStatusCode !== null ) {
            const mapped = mapProviderStatusToS3Error( upstreamStatusCode )
            return withCors( request, s3ErrorResponse( mapped.status, mapped.code, mapped.message, resource ) )
        }
        if ( error && typeof error === "object" && "$metadata" in error ) {
            const metadata = ( error as { $metadata?: unknown } ).$metadata
            console.error( "[S3 Gateway] Unhandled request error metadata:", metadata )
        }
        console.error( "[S3 Gateway] Unhandled request error:", error )
        return withCors( request, s3ErrorResponse( 500, "InternalError", message, resource ) )
    }
}
