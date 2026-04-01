import { createFileRoute } from "@tanstack/react-router"
import { parseAccessKeyId, resolveBucketByAccessKey, resolveBucketByName, isSecretValid } from "@/lib/s3-gateway/s3-context"
import {
    abortMultipartUpload,
    completeMultipartUpload,
    createMultipartUpload,
    uploadPart,
} from "@/lib/s3-gateway/s3-multipart"
import {
    deleteObject,
    getObject,
    headObject,
    listObjectsV2,
    putObject,
} from "@/lib/s3-gateway/s3-object-store"
import {
    hasMultipartCreateFlag,
    listPrefix,
    listTypeIsV2,
    multipartPartNumber,
    multipartUploadId,
    parseS3Path,
} from "@/lib/s3-gateway/s3-request"
import {
    completeMultipartUploadXml,
    createMultipartUploadXml,
    listBucketsXml,
    listObjectsV2Xml,
    s3ErrorResponse,
    xmlResponse,
} from "@/lib/s3-gateway/s3-xml"

async function readBodyBytes( request: Request ): Promise<Uint8Array> {
    const buffer = await request.arrayBuffer()
    return new Uint8Array( buffer )
}

async function resolveAuthorizedBucket( request: Request, bucketName: string | null ) {
    const accessKeyId = parseAccessKeyId( request )
    if ( !accessKeyId ) {
        return null
    }

    const byAccessKey = await resolveBucketByAccessKey( accessKeyId )
    if ( !byAccessKey ) {
        return null
    }

    const candidateBucket = bucketName
        ? await resolveBucketByName( bucketName )
        : byAccessKey

    if ( !candidateBucket ) {
        return null
    }

    const authorization = request.headers.get( "authorization" )
    if ( !authorization ) {
        return candidateBucket
    }

    const providedSecret = request.headers.get( "x-s3-secret-access-key" )
    if ( providedSecret && !isSecretValid( candidateBucket, providedSecret ) ) {
        return null
    }

    return candidateBucket
}

async function handleGet( request: Request ): Promise<Response> {
    const parsed = parseS3Path( request.url )

    if ( !parsed.bucketName ) {
        const accessKeyId = parseAccessKeyId( request )
        if ( !accessKeyId ) {
            return s3ErrorResponse( 403, "AccessDenied", "Missing credentials", "/" )
        }
        const bucket = await resolveBucketByAccessKey( accessKeyId )
        if ( !bucket ) {
            return s3ErrorResponse( 403, "AccessDenied", "Invalid credentials", "/" )
        }
        return xmlResponse( listBucketsXml( bucket.bucketName, bucket.createdAt ) )
    }

    const bucket = await resolveAuthorizedBucket( request, parsed.bucketName )
    if ( !bucket ) {
        return s3ErrorResponse( 403, "AccessDenied", "Access denied", `/${parsed.bucketName}` )
    }

    if ( !parsed.objectKey ) {
        if ( !listTypeIsV2( request.url ) ) {
            return s3ErrorResponse( 400, "InvalidRequest", "Only list-type=2 is supported", `/${bucket.bucketName}` )
        }

        const prefix = listPrefix( request.url )
        const objects = await listObjectsV2( bucket, prefix )
        return xmlResponse( listObjectsV2Xml( bucket.bucketName, prefix, objects ) )
    }

    const object = await getObject( bucket, parsed.objectKey )
    if ( !object ) {
        return s3ErrorResponse( 404, "NoSuchKey", "The specified key does not exist", `/${bucket.bucketName}/${parsed.objectKey}` )
    }

    return object
}

async function handleHead( request: Request ): Promise<Response> {
    const parsed = parseS3Path( request.url )
    if ( !parsed.bucketName ) {
        return new Response( null, { status: 400 } )
    }

    const bucket = await resolveAuthorizedBucket( request, parsed.bucketName )
    if ( !bucket ) {
        return new Response( null, { status: 403 } )
    }

    if ( !parsed.objectKey ) {
        return new Response( null, { status: 200 } )
    }

    const object = await headObject( bucket, parsed.objectKey )
    if ( !object ) {
        return new Response( null, { status: 404 } )
    }
    return object
}

async function handlePut( request: Request ): Promise<Response> {
    const parsed = parseS3Path( request.url )
    if ( !parsed.bucketName || !parsed.objectKey ) {
        return s3ErrorResponse( 400, "InvalidRequest", "Bucket and key are required", "/" )
    }

    const bucket = await resolveAuthorizedBucket( request, parsed.bucketName )
    if ( !bucket ) {
        return s3ErrorResponse( 403, "AccessDenied", "Access denied", `/${parsed.bucketName}/${parsed.objectKey}` )
    }

    const uploadId = multipartUploadId( request.url )
    const partNumber = multipartPartNumber( request.url )

    const body = await readBodyBytes( request )
    const contentType = request.headers.get( "content-type" )

    if ( uploadId && partNumber ) {
        const eTag = await uploadPart( bucket, parsed.objectKey, uploadId, body, contentType )
        return new Response( null, {
            status: 200,
            headers: {
                ETag: eTag ?? "",
            },
        } )
    }

    const eTag = await putObject( bucket, parsed.objectKey, body, contentType )
    return new Response( null, {
        status: 200,
        headers: {
            ETag: eTag ?? "",
        },
    } )
}

async function handleDelete( request: Request ): Promise<Response> {
    const parsed = parseS3Path( request.url )
    if ( !parsed.bucketName ) {
        return new Response( null, { status: 400 } )
    }

    const bucket = await resolveAuthorizedBucket( request, parsed.bucketName )
    if ( !bucket ) {
        return new Response( null, { status: 403 } )
    }

    const uploadId = multipartUploadId( request.url )
    if ( uploadId ) {
        await abortMultipartUpload( bucket, uploadId )
        return new Response( null, { status: 204 } )
    }

    if ( !parsed.objectKey ) {
        return new Response( null, { status: 400 } )
    }

    await deleteObject( bucket, parsed.objectKey )
    return new Response( null, { status: 204 } )
}

async function handlePost( request: Request ): Promise<Response> {
    const parsed = parseS3Path( request.url )
    if ( !parsed.bucketName || !parsed.objectKey ) {
        return s3ErrorResponse( 400, "InvalidRequest", "Bucket and key are required", "/" )
    }

    const bucket = await resolveAuthorizedBucket( request, parsed.bucketName )
    if ( !bucket ) {
        return s3ErrorResponse( 403, "AccessDenied", "Access denied", `/${parsed.bucketName}/${parsed.objectKey}` )
    }

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

export const Route = createFileRoute( "/api/storage/s3/$" as never )( {
    component: () => null,
    server: {
        handlers: {
            GET: async ( { request } ) => handleGet( request ),
            HEAD: async ( { request } ) => handleHead( request ),
            PUT: async ( { request } ) => handlePut( request ),
            DELETE: async ( { request } ) => handleDelete( request ),
            POST: async ( { request } ) => handlePost( request ),
        },
    },
} )
