import { eq, and, inArray } from "drizzle-orm"

export async function touchFolderOpened( userId: string, folderId: string ) {
    const [{ db }, { folder }] = await Promise.all( [
        import( "@/db" ),
        import( "@/db/schema/storage" ),
    ] )
    await db.update( folder )
        .set( { lastOpenedAt: new Date() } )
        .where( and( eq( folder.id, folderId ), eq( folder.userId, userId ) ) )
}

export async function renameItem(
    userId: string,
    itemId: string,
    newName: string,
    itemType: "file" | "folder"
) {
    const [{ db }, { file: storageFile, folder }] = await Promise.all( [
        import( "@/db" ),
        import( "@/db/schema/storage" ),
    ] )

    if ( itemType === "folder" ) {
        const [updated] = await db.update( folder )
            .set( { name: newName } )
            .where( and( eq( folder.id, itemId ), eq( folder.userId, userId ) ) )
            .returning( { id: folder.id, name: folder.name } )
        return updated
    }

    const [updated] = await db.update( storageFile )
        .set( { name: newName } )
        .where( and( eq( storageFile.id, itemId ), eq( storageFile.userId, userId ) ) )
        .returning( { id: storageFile.id, name: storageFile.name } )
    return updated
}

export async function deleteItems(
    userId: string,
    itemIds: string[],
    itemTypes: ( "file" | "folder" )[]
) {
    const [{ db }, { file: storageFile, folder }] = await Promise.all( [
        import( "@/db" ),
        import( "@/db/schema/storage" ),
    ] )

    const now = new Date()
    const fileIds: string[] = []
    const folderIds: string[] = []
    for ( let i = 0; i < itemIds.length; i++ ) {
        if ( itemTypes[i] === "file" ) fileIds.push( itemIds[i] )
        else folderIds.push( itemIds[i] )
    }

    // Soft-delete files
    if ( fileIds.length > 0 ) {
        await db.update( storageFile )
            .set( { isDeleted: true, deletedAt: now } )
            .where( and( inArray( storageFile.id, fileIds ), eq( storageFile.userId, userId ) ) )
    }

    if ( folderIds.length > 0 ) {
        // BFS: recursively collect all descendant folder IDs.
        // Each iteration queries one level of depth; for typical folder depths (< 10)
        // this is acceptable. A recursive CTE would be more efficient for deeply nested trees.
        const allFolderIds: string[] = [...folderIds]
        let toProcess: string[] = [...folderIds]

        while ( toProcess.length > 0 ) {
            const children = await db
                .select( { id: folder.id } )
                .from( folder )
                .where(
                    and(
                        eq( folder.userId, userId ),
                        inArray( folder.parentFolderId, toProcess )
                    )
                )
            const childIds = children.map( ( c ) => c.id )
            if ( childIds.length === 0 ) break
            allFolderIds.push( ...childIds )
            toProcess = childIds
        }

        // Soft-delete all folders (including descendants)
        await db.update( folder )
            .set( { isDeleted: true, deletedAt: now } )
            .where( and( inArray( folder.id, allFolderIds ), eq( folder.userId, userId ) ) )

        // Soft-delete all files inside those folders
        await db.update( storageFile )
            .set( { isDeleted: true, deletedAt: now } )
            .where( and( inArray( storageFile.folderId, allFolderIds ), eq( storageFile.userId, userId ) ) )
    }

    return { deletedFiles: fileIds.length, deletedFolders: folderIds.length }
}

export async function moveItems(
    userId: string,
    itemIds: string[],
    itemTypes: ( "file" | "folder" )[],
    targetFolderId: string | null
) {
    const [{ db }, { file: storageFile, folder }] = await Promise.all( [
        import( "@/db" ),
        import( "@/db/schema/storage" ),
    ] )

    for ( let i = 0; i < itemIds.length; i++ ) {
        const id = itemIds[i]
        const type = itemTypes[i]
        if ( type === "folder" ) {
            await db.update( folder )
                .set( { parentFolderId: targetFolderId } )
                .where( and( eq( folder.id, id ), eq( folder.userId, userId ) ) )
        } else {
            await db.update( storageFile )
                .set( { folderId: targetFolderId } )
                .where( and( eq( storageFile.id, id ), eq( storageFile.userId, userId ) ) )
        }
    }

    return { moved: itemIds.length }
}

export async function getFilePresignedUrl( userId: string, fileId: string ) {
    const [{ db }, { file: storageFile }] = await Promise.all( [
        import( "@/db" ),
        import( "@/db/schema/storage" ),
    ] )

    const [row] = await db.select( {
        objectKey: storageFile.objectKey,
        mimeType: storageFile.mimeType,
        name: storageFile.name,
    } ).from( storageFile )
        .where( and( eq( storageFile.id, fileId ), eq( storageFile.userId, userId ) ) )
        .limit( 1 )

    if ( !row ) throw new Error( "File not found" )

    // Update lastOpenedAt
    await db.update( storageFile )
        .set( { lastOpenedAt: new Date() } )
        .where( eq( storageFile.id, fileId ) )

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
        Key: row.objectKey,
        ResponseContentDisposition: `inline; filename="${row.name}"`,
    } )

    const url = await getSignedUrl( s3Client, command, { expiresIn: 3600 } )
    return { url, name: row.name, mimeType: row.mimeType }
}
