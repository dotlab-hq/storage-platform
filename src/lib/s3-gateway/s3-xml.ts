const XML_CONTENT_TYPE = "application/xml"

function escapeXml( value: string ): string {
    return value
        .replaceAll( "&", "&amp;" )
        .replaceAll( "<", "&lt;" )
        .replaceAll( ">", "&gt;" )
        .replaceAll( '"', "&quot;" )
        .replaceAll( "'", "&apos;" )
}

export function xmlResponse( body: string, status = 200, headers?: HeadersInit ): Response {
    return new Response( body, {
        status,
        headers: {
            "Content-Type": XML_CONTENT_TYPE,
            ...headers,
        },
    } )
}

export function s3ErrorResponse( status: number, code: string, message: string, resource: string ): Response {
    const body = `<?xml version="1.0" encoding="UTF-8"?>\n<Error><Code>${escapeXml( code )}</Code><Message>${escapeXml( message )}</Message><Resource>${escapeXml( resource )}</Resource></Error>`
    return xmlResponse( body, status )
}

export function listBucketsXml( bucketName: string, createdAt: Date ): string {
    const creationDate = createdAt.toISOString()
    return `<?xml version="1.0" encoding="UTF-8"?>\n<ListAllMyBucketsResult xmlns="http://s3.amazonaws.com/doc/2006-03-01/"><Buckets><Bucket><Name>${escapeXml( bucketName )}</Name><CreationDate>${escapeXml( creationDate )}</CreationDate></Bucket></Buckets></ListAllMyBucketsResult>`
}

export type S3ObjectItem = {
    key: string
    size: number
    eTag: string | null
    lastModified: Date
}

export function listObjectsV2Xml( bucketName: string, prefix: string, items: S3ObjectItem[] ): string {
    const contents = items
        .map( ( item ) => `<Contents><Key>${escapeXml( item.key )}</Key><LastModified>${escapeXml( item.lastModified.toISOString() )}</LastModified><ETag>${escapeXml( item.eTag ?? "" )}</ETag><Size>${item.size}</Size><StorageClass>STANDARD</StorageClass></Contents>` )
        .join( "" )

    return `<?xml version="1.0" encoding="UTF-8"?>\n<ListBucketResult xmlns="http://s3.amazonaws.com/doc/2006-03-01/"><Name>${escapeXml( bucketName )}</Name><Prefix>${escapeXml( prefix )}</Prefix><KeyCount>${items.length}</KeyCount><MaxKeys>1000</MaxKeys><IsTruncated>false</IsTruncated>${contents}</ListBucketResult>`
}

export function createMultipartUploadXml( bucketName: string, key: string, uploadId: string ): string {
    return `<?xml version="1.0" encoding="UTF-8"?>\n<InitiateMultipartUploadResult xmlns="http://s3.amazonaws.com/doc/2006-03-01/"><Bucket>${escapeXml( bucketName )}</Bucket><Key>${escapeXml( key )}</Key><UploadId>${escapeXml( uploadId )}</UploadId></InitiateMultipartUploadResult>`
}

export function completeMultipartUploadXml( bucketName: string, key: string, eTag: string ): string {
    return `<?xml version="1.0" encoding="UTF-8"?>\n<CompleteMultipartUploadResult xmlns="http://s3.amazonaws.com/doc/2006-03-01/"><Location></Location><Bucket>${escapeXml( bucketName )}</Bucket><Key>${escapeXml( key )}</Key><ETag>${escapeXml( eTag )}</ETag></CompleteMultipartUploadResult>`
}
