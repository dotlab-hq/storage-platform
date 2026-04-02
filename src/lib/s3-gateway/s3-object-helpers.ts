import { normalizeETag } from "@/lib/s3-gateway/s3-conditional-cache"

export function assertPresignedUrlEndpoint( presignedUrl: string, providerEndpoint: string ): void {
    const signedUrl = new URL( presignedUrl )
    const expected = new URL( providerEndpoint )
    if ( signedUrl.protocol !== expected.protocol || signedUrl.host !== expected.host ) {
        throw new Error( "Generated redirect URL endpoint does not match configured provider endpoint" )
    }
}

/**
 * Persists ETag with provider HEAD result taking precedence over PUT response ETag.
 * Some providers omit ETag on PUT, while HEAD is more reliable after object commit.
 */
export function resolvePersistedETag( metadataETag: string | undefined, putResultETag: string | undefined ): string | null {
    if ( metadataETag !== undefined ) return normalizeETag( metadataETag )
    if ( putResultETag !== undefined ) return normalizeETag( putResultETag )
    return null
}
