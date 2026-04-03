import { and, eq, inArray } from "drizzle-orm"

export async function setFolderPrivateLock(
    userId: string,
    folderId: string,
    isPrivatelyLocked: boolean
) {
    const [{ db }, { folder, file }] = await Promise.all( [
        import( "@/db" ),
        import( "@/db/schema/storage" ),
    ] )

    const updatedFolders = await db.update( folder )
        .set( { isPrivatelyLocked } )
        .where( and( eq( folder.id, folderId ), eq( folder.userId, userId ) ) )
        .returning( { id: folder.id, isPrivatelyLocked: folder.isPrivatelyLocked } )

    if ( updatedFolders.length === 0 ) {
        throw new Error( "Folder not found" )
    }

    const visited = new Set<string>()
    let frontier: string[] = [folderId]
    const descendantIds: string[] = []
    const MAX_DEPTH = 100
    let depth = 0

    while ( frontier.length > 0 ) {
        if ( depth > MAX_DEPTH ) {
            throw new Error( "Folder traversal exceeded safe depth limit" )
        }

        const newFrontier = frontier.filter( ( id ) => !visited.has( id ) )
        if ( newFrontier.length === 0 ) {
            break
        }

        for ( const id of newFrontier ) {
            visited.add( id )
            descendantIds.push( id )
        }

        const childRows = await db.select( { id: folder.id } )
            .from( folder )
            .where( and( eq( folder.userId, userId ), eq( folder.isDeleted, false ), inArray( folder.parentFolderId, newFrontier ) ) )

        frontier = childRows.map( ( row ) => row.id )
        depth += 1
    }

    if ( descendantIds.length > 0 ) {
        await db.update( file )
            .set( { isPrivatelyLocked } )
            .where( and( eq( file.userId, userId ), inArray( file.folderId, descendantIds ) ) )
    }

    return updatedFolders[0]
}
