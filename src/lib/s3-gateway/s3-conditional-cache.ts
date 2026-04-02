export type ObjectConditionalHeaders = {
    ifNoneMatch: string | null
    ifModifiedSince: string | null
}

type StatusMetadataError = {
    $metadata?: {
        httpStatusCode?: number
    }
}

export function isStatusMetadataError( error: unknown ): error is StatusMetadataError {
    if ( typeof error !== "object" || !error ) return false
    if ( !( "$metadata" in error ) ) return false
    const withMetadata = error as StatusMetadataError
    return typeof withMetadata.$metadata === "object" || typeof withMetadata.$metadata === "undefined"
}

export function buildCacheHeaders( input: {
    eTag: string | null | undefined
    lastModified: Date | undefined
    cacheControl: string | null | undefined
} ): Headers {
    const headers = new Headers()
    headers.set( "ETag", input.eTag ?? "" )
    headers.set( "Cache-Control", input.cacheControl ?? "public, max-age=31536000, immutable" )
    if ( input.lastModified ) {
        headers.set( "Last-Modified", input.lastModified.toUTCString() )
    }
    return headers
}

export function parseHttpDate( value: string | null ): Date | undefined {
    if ( !value ) return undefined
    const parsed = Date.parse( value )
    if ( Number.isNaN( parsed ) ) return undefined
    return new Date( parsed )
}
