import type { BucketCorsRuleRecord, MultipartPartListItem, MultipartUploadListItem } from "@/lib/s3-gateway/s3-bucket-controls"

function escapeXml( value: string ): string {
    return value
        .replaceAll( "&", "&amp;" )
        .replaceAll( "<", "&lt;" )
        .replaceAll( ">", "&gt;" )
        .replaceAll( '"', "&quot;" )
        .replaceAll( "'", "&apos;" )
}

function tag( name: string, value: string | number ): string {
    return `<${name}>${escapeXml( String( value ) )}</${name}>`
}

export function bucketLocationXml( region: string ): string {
    return `<?xml version="1.0" encoding="UTF-8"?>\n<LocationConstraint xmlns="http://s3.amazonaws.com/doc/2006-03-01/">${escapeXml( region )}</LocationConstraint>`
}

export function bucketVersioningXml( state: string ): string {
    if ( state === "disabled" ) {
        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<VersioningConfiguration xmlns=\"http://s3.amazonaws.com/doc/2006-03-01/\"></VersioningConfiguration>"
    }
    const status = state === "suspended" ? "Suspended" : "Enabled"
    return `<?xml version="1.0" encoding="UTF-8"?>\n<VersioningConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">${tag( "Status", status )}</VersioningConfiguration>`
}

export function bucketCorsXml( rules: BucketCorsRuleRecord[] ): string {
    const ruleXml = rules
        .map( ( rule ) => {
            const origins = rule.allowedOrigins.map( ( origin ) => tag( "AllowedOrigin", origin ) ).join( "" )
            const methods = rule.allowedMethods.map( ( method ) => tag( "AllowedMethod", method ) ).join( "" )
            const headers = rule.allowedHeaders.map( ( header ) => tag( "AllowedHeader", header ) ).join( "" )
            const exposed = rule.exposeHeaders.map( ( header ) => tag( "ExposeHeader", header ) ).join( "" )
            const maxAge = rule.maxAgeSeconds === null ? "" : tag( "MaxAgeSeconds", rule.maxAgeSeconds )
            return `<CORSRule>${origins}${methods}${headers}${exposed}${maxAge}</CORSRule>`
        } )
        .join( "" )

    return `<?xml version="1.0" encoding="UTF-8"?>\n<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">${ruleXml}</CORSConfiguration>`
}

export function listMultipartUploadsXml( bucketName: string, uploads: MultipartUploadListItem[] ): string {
    const uploadsXml = uploads
        .map( ( upload ) => `<Upload>${tag( "Key", upload.key )}${tag( "UploadId", upload.uploadId )}${tag( "Initiated", upload.initiated.toISOString() )}</Upload>` )
        .join( "" )
    return `<?xml version="1.0" encoding="UTF-8"?>\n<ListMultipartUploadsResult xmlns="http://s3.amazonaws.com/doc/2006-03-01/">${tag( "Bucket", bucketName )}${uploadsXml}</ListMultipartUploadsResult>`
}

export function listPartsXml( bucketName: string, objectKey: string, uploadId: string, parts: MultipartPartListItem[] ): string {
    const partsXml = parts
        .map( ( part ) => `<Part>${tag( "PartNumber", part.partNumber )}${tag( "LastModified", part.lastModified.toISOString() )}${tag( "ETag", part.etag ?? "" )}${tag( "Size", part.size )}</Part>` )
        .join( "" )
    return `<?xml version="1.0" encoding="UTF-8"?>\n<ListPartsResult xmlns="http://s3.amazonaws.com/doc/2006-03-01/">${tag( "Bucket", bucketName )}${tag( "Key", objectKey )}${tag( "UploadId", uploadId )}${partsXml}</ListPartsResult>`
}

export type ParsedVersioningState = "enabled" | "suspended" | "disabled"

export function parseVersioningState( xml: string ): ParsedVersioningState {
    const statusMatch = xml.match( /<Status>\s*([^<]+)\s*<\/Status>/i )
    const value = statusMatch?.[1]?.trim().toLowerCase()
    if ( value === "enabled" ) {
        return "enabled"
    }
    if ( value === "suspended" ) {
        return "suspended"
    }
    return "disabled"
}

function collectTagValues( block: string, tagName: string ): string[] {
    const matches = [...block.matchAll( new RegExp( `<${tagName}>\\s*([^<]+)\\s*<\\/${tagName}>`, "gi" ) )]
    return matches.map( ( match ) => match[1] ).filter( ( value ) => value.length > 0 )
}

export function parseBucketCorsXml( xml: string ): BucketCorsRuleRecord[] {
    const ruleMatches = [...xml.matchAll( /<CORSRule>([\s\S]*?)<\/CORSRule>/gi )]
    return ruleMatches.map( ( match ) => {
        const block = match[1]
        const maxAgeMatch = block.match( /<MaxAgeSeconds>\s*(\d+)\s*<\/MaxAgeSeconds>/i )
        return {
            allowedOrigins: collectTagValues( block, "AllowedOrigin" ),
            allowedMethods: collectTagValues( block, "AllowedMethod" ),
            allowedHeaders: collectTagValues( block, "AllowedHeader" ),
            exposeHeaders: collectTagValues( block, "ExposeHeader" ),
            maxAgeSeconds: maxAgeMatch ? Number.parseInt( maxAgeMatch[1], 10 ) : null,
        }
    } )
}
