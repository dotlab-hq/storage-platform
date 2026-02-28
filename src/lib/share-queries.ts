import { eq } from "drizzle-orm"

export async function getShareByToken( token: string ) {
    const [{ db }, { shareLink, file: storageFile, folder }] = await Promise.all( [
        import( "@/db" ),
        import( "@/db/schema/storage" ),
    ] )

    const [link] = await db.select().from( shareLink )
        .where( eq( shareLink.shareToken, token ) )
        .limit( 1 )

    if ( !link || !link.isActive ) return null

    if ( link.expiresAt && link.expiresAt < new Date() ) return null

    if ( link.fileId ) {
        const [fileRow] = await db.select( {
            id: storageFile.id,
            name: storageFile.name,
            mimeType: storageFile.mimeType,
            sizeInBytes: storageFile.sizeInBytes,
            objectKey: storageFile.objectKey,
        } ).from( storageFile ).where( eq( storageFile.id, link.fileId ) ).limit( 1 )
        return { type: "file" as const, link, item: fileRow ?? null }
    }

    if ( link.folderId ) {
        const [folderRow] = await db.select( {
            id: folder.id,
            name: folder.name,
        } ).from( folder ).where( eq( folder.id, link.folderId ) ).limit( 1 )
        return { type: "folder" as const, link, item: folderRow ?? null }
    }

    return null
}

export async function getSharedFilePresignedUrl( objectKey: string, fileName: string ) {
    const { GetObjectCommand, S3Client } = await import( "@aws-sdk/client-s3" )
    const { getSignedUrl } = await import( "@aws-sdk/s3-request-presigner" )

    const s3Client = new S3Client( {
        region: process.env.S3_REGION,
        endpoint: process.env.S3_ENDPOINT,
        forcePathStyle: true,
        bucketEndpoint: false,
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY_ID!,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
        },
    } )

    const command = new GetObjectCommand( {
        Bucket: "dot-storage",
        Key: objectKey,
        ResponseContentDisposition: `inline; filename="${fileName}"`,
    } )

    return getSignedUrl( s3Client, command, { expiresIn: 3600 } )
}
