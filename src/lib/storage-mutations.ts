import { eq, and, inArray } from "drizzle-orm"
import { getProviderClientById } from "@/lib/s3-provider-client"
import { isDescendantFolder } from "@/lib/folder-paths"
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

    const movingFolderIds = itemIds.filter( ( _, index ) => itemTypes[index] === "folder" )
    let targetIsPrivatelyLocked = false
    let allUserFolders: { id: string; parentFolderId: string | null }[] = []

    if ( targetFolderId ) {
        const targetFolderRows = await db.select( {
            id: folder.id,
            isPrivatelyLocked: folder.isPrivatelyLocked,
        } )
            .from( folder )
            .where( and( eq( folder.id, targetFolderId ), eq( folder.userId, userId ) ) )
            .limit( 1 )

        if ( targetFolderRows.length === 0 ) {
            throw new Error( "Target folder not found" )
        }

        targetIsPrivatelyLocked = targetFolderRows[0].isPrivatelyLocked

        if ( movingFolderIds.length > 0 ) {
            allUserFolders = await db.select( {
                id: folder.id,
                parentFolderId: folder.parentFolderId,
            } )
                .from( folder )
                .where( eq( folder.userId, userId ) )

            for ( const movingFolderId of movingFolderIds ) {
                if ( isDescendantFolder( movingFolderId, targetFolderId, allUserFolders ) ) {
                    throw new Error( "Cannot move a folder into itself or its descendant" )
                }
            }
        }
    }

    for ( let i = 0; i < itemIds.length; i++ ) {
        const id = itemIds[i]
        const type = itemTypes[i]
        if ( type === "folder" ) {
            await db.update( folder )
                .set( { parentFolderId: targetFolderId } )
                .where( and( eq( folder.id, id ), eq( folder.userId, userId ) ) )
        } else {
            await db.update( storageFile )
                .set( { folderId: targetFolderId, isPrivatelyLocked: targetIsPrivatelyLocked } )
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

    const fileRows = await db.select( {
        objectKey: storageFile.objectKey,
        mimeType: storageFile.mimeType,
        name: storageFile.name,
        providerId: storageFile.providerId,
    } ).from( storageFile )
        .where( and( eq( storageFile.id, fileId ), eq( storageFile.userId, userId ) ) )
        .limit( 1 )
    if ( fileRows.length === 0 ) {
        throw new Error( "File not found" )
    }
    const row = fileRows[0]

    // Update lastOpenedAt
    await db.update( storageFile )
        .set( { lastOpenedAt: new Date() } )
        .where( eq( storageFile.id, fileId ) )

    const { GetObjectCommand } = await import( "@aws-sdk/client-s3" )
    const { getSignedUrl } = await import( "@aws-sdk/s3-request-presigner" )
    const provider = await getProviderClientById( row.providerId ?? null )

    const command = new GetObjectCommand( {
        Bucket: provider.bucketName,
        Key: row.objectKey,
        ResponseContentDisposition: `inline; filename="${row.name}"`,
    } )

    const url = await getSignedUrl( provider.client, command, { expiresIn: 3600 } )
    return { url, name: row.name, mimeType: row.mimeType }
}
