import type { BucketContext } from "@/lib/s3-gateway/s3-context"
import { isSigV4Valid, isSecretValid, parseAccessKeyId, resolveBucketByAccessKey } from "@/lib/s3-gateway/s3-context"
import { isActionAllowed } from "@/lib/s3-gateway/s3-authz"

export type ErrorWithMetadata = {
    $metadata?: {
        httpStatusCode?: number
    }
}

export function providerHttpStatusCode( error: unknown ): number | null {
    if ( !error || typeof error !== "object" ) {
        return null
    }
    const metadata = ( error as ErrorWithMetadata ).$metadata
    if ( !metadata || typeof metadata.httpStatusCode !== "number" ) {
        return null
    }
    return metadata.httpStatusCode
}

export function mapProviderStatusToS3Error( statusCode: number ): { status: number, code: string, message: string } {
    if ( statusCode === 400 ) return { status: 400, code: "InvalidRequest", message: "The request sent to the upstream storage provider was invalid" }
    if ( statusCode === 401 || statusCode === 403 ) return { status: 403, code: "AccessDenied", message: "Access denied by upstream storage provider" }
    if ( statusCode === 404 ) return { status: 404, code: "NoSuchKey", message: "The specified key does not exist" }
    if ( statusCode === 409 ) return { status: 409, code: "Conflict", message: "The request conflicts with the current state of the resource" }
    if ( statusCode === 413 ) return { status: 413, code: "EntityTooLarge", message: "Your proposed upload exceeds the maximum allowed object size" }
    if ( statusCode === 429 ) return { status: 503, code: "SlowDown", message: "Please reduce your request rate" }
    if ( statusCode >= 500 ) return { status: 503, code: "ServiceUnavailable", message: "Upstream storage provider is temporarily unavailable" }
    return { status: 502, code: "BadGateway", message: "Upstream storage provider request failed" }
}

export function parseContentLength( request: Request ): number | null {
    const raw = request.headers.get( "content-length" )
    if ( !raw ) return null
    const parsed = Number.parseInt( raw, 10 )
    if ( !Number.isFinite( parsed ) || parsed < 0 ) return null
    return parsed
}

export async function resolveAuthorizedBucket( request: Request, bucketName: string | null ): Promise<BucketContext | null> {
    const accessKeyId = parseAccessKeyId( request )
    if ( !accessKeyId ) return null
    const byAccessKey = await resolveBucketByAccessKey( accessKeyId )
    if ( !byAccessKey ) return null

    // Access keys are bucket-scoped in this gateway, so avoid resolving by global
    // bucket name here to prevent mismatches when different users share a name.
    if ( bucketName && byAccessKey.bucketName !== bucketName ) {
        return null
    }
    const candidateBucket = byAccessKey

    if ( isSigV4Valid( request, candidateBucket ) ) {
        return candidateBucket
    }
    const providedSecret = request.headers.get( "x-s3-secret-access-key" )
    if ( providedSecret && !isSecretValid( candidateBucket, providedSecret ) ) return null
    return providedSecret ? candidateBucket : null
}

export async function ensureAccess(
    bucket: BucketContext,
    request: Request,
    action: Parameters<typeof isActionAllowed>[0]["action"],
    objectKey: string | null,
): Promise<boolean> {
    const accessKeyId = parseAccessKeyId( request )
    const signedIdentity = accessKeyId
        ? ( isSigV4Valid( request, bucket ) || ( request.headers.get( "x-s3-secret-access-key" ) ? isSecretValid( bucket, request.headers.get( "x-s3-secret-access-key" ) ?? "" ) : false ) )
        : false
    const effectiveAccessKeyId = signedIdentity ? accessKeyId : null
    return isActionAllowed( { bucket, action, accessKeyId: effectiveAccessKeyId, objectKey } )
}
