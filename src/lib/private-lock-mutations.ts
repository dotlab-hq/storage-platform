import { and, eq, sql } from "drizzle-orm"

export async function setFolderPrivateLock(
    userId: string,
    folderId: string,
    isPrivatelyLocked: boolean
) {
    const [{ db }, { folder }] = await Promise.all( [
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

    await db.execute( sql`
        WITH RECURSIVE folder_tree AS (
            SELECT f.id
            FROM "dot-storage"."folder" f
            WHERE f.id = ${folderId}
              AND f.user_id = ${userId}
              AND f.is_deleted = false
            UNION ALL
            SELECT child.id
            FROM "dot-storage"."folder" child
            INNER JOIN folder_tree ON child.parent_folder_id = folder_tree.id
            WHERE child.user_id = ${userId}
              AND child.is_deleted = false
        )
        UPDATE "dot-storage"."file" fl
        SET is_privately_locked = ${isPrivatelyLocked}
        FROM folder_tree
        WHERE fl.folder_id = folder_tree.id
          AND fl.user_id = ${userId}
    ` )

    return updatedFolders[0]
}
