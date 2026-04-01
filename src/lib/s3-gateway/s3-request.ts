export type ParsedS3Path = {
    bucketName: string | null
    objectKey: string | null
}

const S3_BASE_PATH = "/api/storage/s3"

export function parseS3Path( requestUrl: string ): ParsedS3Path {
    const url = new URL( requestUrl )
    const pathname = url.pathname

    if ( pathname === S3_BASE_PATH || pathname === `${S3_BASE_PATH}/` ) {
        return {
            bucketName: null,
            objectKey: null,
        }
    }

    if ( !pathname.startsWith( `${S3_BASE_PATH}/` ) ) {
        return {
            bucketName: null,
            objectKey: null,
        }
    }

    const rest = pathname.slice( `${S3_BASE_PATH}/`.length )
    const parts = rest.split( "/" ).filter( ( item ) => item.length > 0 )
    const bucketName = parts[0] ?? null
    const objectKey = parts.length > 1
        ? decodeURIComponent( parts.slice( 1 ).join( "/" ) )
        : null

    return {
        bucketName,
        objectKey,
    }
}

export function hasMultipartCreateFlag( requestUrl: string ): boolean {
    const url = new URL( requestUrl )
    return url.searchParams.has( "uploads" )
}

export function multipartUploadId( requestUrl: string ): string | null {
    const url = new URL( requestUrl )
    const value = url.searchParams.get( "uploadId" )
    return value && value.length > 0 ? value : null
}

export function multipartPartNumber( requestUrl: string ): number | null {
    const url = new URL( requestUrl )
    const value = url.searchParams.get( "partNumber" )
    if ( !value ) {
        return null
    }
    const parsed = Number( value )
    if ( Number.isInteger( parsed ) && parsed > 0 ) {
        return parsed
    }
    return null
}

export function listPrefix( requestUrl: string ): string {
    const url = new URL( requestUrl )
    return url.searchParams.get( "prefix" ) ?? ""
}

export function listTypeIsV2( requestUrl: string ): boolean {
    const url = new URL( requestUrl )
    return url.searchParams.get( "list-type" ) === "2"
}
