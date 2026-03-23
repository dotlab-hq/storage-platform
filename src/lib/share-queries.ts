import { eq, sql } from "drizzle-orm"

async function buildPresignedUrl( objectKey: string, fileName: string, disposition: "inline" | "attachment" ) {
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
        ResponseContentDisposition: `${disposition}; filename="${fileName}"`,
    } )

    return getSignedUrl( s3Client, command, { expiresIn: 3600 } )
}

export async function getShareByToken( token: string ) {
    const [{ db }, { shareLink, file: storageFile, folder }] = await Promise.all( [
        import( "@/db" ),
        import( "@/db/schema/storage" ),
    ] )

    const linkRows = await db.select().from( shareLink )
        .where( eq( shareLink.shareToken, token ) )
        .limit( 1 )
    if ( linkRows.length === 0 ) return null
    const link = linkRows[0]
    if ( !link.isActive ) return null

    if ( link.expiresAt && link.expiresAt < new Date() ) return null

    if ( link.fileId ) {
        const fileRows = await db.select( {
            id: storageFile.id,
            name: storageFile.name,
            mimeType: storageFile.mimeType,
            sizeInBytes: storageFile.sizeInBytes,
            objectKey: storageFile.objectKey,
        } ).from( storageFile ).where( eq( storageFile.id, link.fileId ) ).limit( 1 )
        if ( fileRows.length === 0 ) return null
        const fileRow = fileRows[0]
        return { type: "file" as const, link, item: fileRow }
    }

    if ( link.folderId ) {
        const folderRows = await db.select( {
            id: folder.id,
            name: folder.name,
        } ).from( folder ).where( eq( folder.id, link.folderId ) ).limit( 1 )
        if ( folderRows.length === 0 ) return null
        const folderRow = folderRows[0]
        return { type: "folder" as const, link, item: folderRow }
    }

    return null
}

export async function getSharedFilePresignedUrl( objectKey: string, fileName: string ) {
    return buildPresignedUrl( objectKey, fileName, "inline" )
}

export async function getSharedFileDownloadUrl( objectKey: string, fileName: string ) {
    return buildPresignedUrl( objectKey, fileName, "attachment" )
}

type SharedFolderNode = {
    id: string
    name: string
    parentFolderId: string | null
    depth: number
}

type SharedFolderFile = {
    id: string
    name: string
    mimeType: string | null
    sizeInBytes: number
    folderId: string | null
}

export async function getSharedFolderTreeByToken( token: string ) {
    const share = await getShareByToken( token )
    if ( !share || share.type !== "folder" || !share.link.folderId ) return null

    const [{ db }] = await Promise.all( [import( "@/db" )] )
    const ownerId = share.link.sharedByUserId
    const rootFolderId = share.link.folderId

    const folderRows = await db.execute<SharedFolderNode>( sql`
        WITH RECURSIVE folder_tree AS (
            SELECT f.id, f.name, f.parent_folder_id AS "parentFolderId", 0::int AS depth
            FROM "dot-storage"."folder" f
            WHERE f.id = ${rootFolderId}
              AND f.user_id = ${ownerId}
              AND f.is_deleted = false
            UNION ALL
            SELECT child.id, child.name, child.parent_folder_id AS "parentFolderId", folder_tree.depth + 1 AS depth
            FROM "dot-storage"."folder" child
            INNER JOIN folder_tree ON child.parent_folder_id = folder_tree.id
            WHERE child.user_id = ${ownerId}
              AND child.is_deleted = false
        )
        SELECT id, name, "parentFolderId", depth
        FROM folder_tree
        ORDER BY depth ASC, name ASC
    ` )

    const fileRows = await db.execute<SharedFolderFile>( sql`
        WITH RECURSIVE folder_tree AS (
            SELECT f.id
            FROM "dot-storage"."folder" f
            WHERE f.id = ${rootFolderId}
              AND f.user_id = ${ownerId}
              AND f.is_deleted = false
            UNION ALL
            SELECT child.id
            FROM "dot-storage"."folder" child
            INNER JOIN folder_tree ON child.parent_folder_id = folder_tree.id
            WHERE child.user_id = ${ownerId}
              AND child.is_deleted = false
        )
        SELECT fl.id, fl.name, fl.mime_type AS "mimeType", fl.size_in_bytes AS "sizeInBytes", fl.folder_id AS "folderId"
        FROM "dot-storage"."file" fl
        INNER JOIN folder_tree ON fl.folder_id = folder_tree.id
        WHERE fl.user_id = ${ownerId}
          AND fl.is_deleted = false
        ORDER BY fl.name ASC
    ` )

    const root = folderRows.rows.find( ( row ) => row.depth === 0 ) ?? null
    if ( !root ) {
        throw new Error( "Shared folder root is missing" )
    }

    return {
        rootFolderId,
        rootFolderName: root.name,
        folders: folderRows.rows,
        files: fileRows.rows,
    }
}
