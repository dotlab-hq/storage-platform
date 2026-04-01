import { and, eq, isNull, ilike, gte, desc, sql } from "drizzle-orm"

const EXCLUDE_VIRTUAL_BUCKET_FOLDERS = sql<boolean>`
    NOT EXISTS (
        SELECT 1
        FROM "dot-storage"."virtual_bucket" vb
        WHERE vb."mapped_folder_id" = "dot-storage"."folder"."id"
          AND vb."is_active" = true
    )
`

export async function listFolderItems( userId: string, folderId: string | null ) {
    const [{ db }, { file: storageFile, folder }] = await Promise.all( [
        import( "@/db" ),
        import( "@/db/schema/storage" ),
    ] )

    const folderWhere = folderId
        ? and( eq( folder.userId, userId ), eq( folder.parentFolderId, folderId ), eq( folder.isDeleted, false ), isNull( folder.virtualBucketId ), EXCLUDE_VIRTUAL_BUCKET_FOLDERS )
        : and( eq( folder.userId, userId ), isNull( folder.parentFolderId ), eq( folder.isDeleted, false ), isNull( folder.virtualBucketId ), EXCLUDE_VIRTUAL_BUCKET_FOLDERS )

    const fileWhere = folderId
        ? and( eq( storageFile.userId, userId ), eq( storageFile.folderId, folderId ), eq( storageFile.isDeleted, false ) )
        : and( eq( storageFile.userId, userId ), isNull( storageFile.folderId ), eq( storageFile.isDeleted, false ) )

    const [folders, files] = await Promise.all( [
        db.select( {
            id: folder.id,
            name: folder.name,
            createdAt: folder.createdAt,
            parentFolderId: folder.parentFolderId,
            isPrivatelyLocked: folder.isPrivatelyLocked,
        } ).from( folder ).where( folderWhere ).orderBy( folder.name ),
        db.select( {
            id: storageFile.id,
            name: storageFile.name,
            sizeInBytes: storageFile.sizeInBytes,
            mimeType: storageFile.mimeType,
            objectKey: storageFile.objectKey,
            createdAt: storageFile.createdAt,
            isPrivatelyLocked: storageFile.isPrivatelyLocked,
        } ).from( storageFile ).where( fileWhere ).orderBy( storageFile.name ),
    ] )

    return { folders, files }
}

export async function searchItems( userId: string, query: string ) {
    const [{ db }, { file: storageFile, folder }] = await Promise.all( [
        import( "@/db" ),
        import( "@/db/schema/storage" ),
    ] )

    const pattern = `%${query}%`

    const [folders, files] = await Promise.all( [
        db.select( {
            id: folder.id,
            name: folder.name,
            createdAt: folder.createdAt,
            parentFolderId: folder.parentFolderId,
            isPrivatelyLocked: folder.isPrivatelyLocked,
        } ).from( folder )
            .where( and( eq( folder.userId, userId ), ilike( folder.name, pattern ), eq( folder.isDeleted, false ), isNull( folder.virtualBucketId ), EXCLUDE_VIRTUAL_BUCKET_FOLDERS ) )
            .limit( 50 ),
        db.select( {
            id: storageFile.id,
            name: storageFile.name,
            sizeInBytes: storageFile.sizeInBytes,
            mimeType: storageFile.mimeType,
            objectKey: storageFile.objectKey,
            createdAt: storageFile.createdAt,
            isPrivatelyLocked: storageFile.isPrivatelyLocked,
        } ).from( storageFile )
            .where( and( eq( storageFile.userId, userId ), ilike( storageFile.name, pattern ), eq( storageFile.isDeleted, false ) ) )
            .limit( 50 ),
    ] )

    return { folders, files }
}

export async function getFolderBreadcrumbs( userId: string, folderId: string ) {
    const [{ db }, { folder }] = await Promise.all( [
        import( "@/db" ),
        import( "@/db/schema/storage" ),
    ] )

    const crumbs: { id: string; name: string }[] = []
    let currentId: string | null = folderId

    while ( currentId ) {
        const rows = await db.select( {
            id: folder.id,
            name: folder.name,
            parentFolderId: folder.parentFolderId,
        } ).from( folder )
            .where( and( eq( folder.id, currentId ), eq( folder.userId, userId ) ) )
            .limit( 1 )

        if ( rows.length === 0 ) break
        const row = rows[0]
        crumbs.unshift( { id: row.id, name: row.name } )
        currentId = row.parentFolderId
    }

    return crumbs
}

export async function getAllFolders( userId: string ) {
    const [{ db }, { folder }] = await Promise.all( [
        import( "@/db" ),
        import( "@/db/schema/storage" ),
    ] )

    return db.select( {
        id: folder.id,
        name: folder.name,
        parentFolderId: folder.parentFolderId,
        isPrivatelyLocked: folder.isPrivatelyLocked,
    } ).from( folder )
        .where( and( eq( folder.userId, userId ), eq( folder.isDeleted, false ), isNull( folder.virtualBucketId ), EXCLUDE_VIRTUAL_BUCKET_FOLDERS ) )
        .orderBy( folder.name )
}

export async function getRecentItems( userId: string ) {
    const [{ db }, { file: storageFile, folder }] = await Promise.all( [
        import( "@/db" ),
        import( "@/db/schema/storage" ),
    ] )

    const cutoff = new Date( Date.now() - 24 * 60 * 60 * 1000 )

    const [folders, files] = await Promise.all( [
        db.select( {
            id: folder.id,
            name: folder.name,
            createdAt: folder.createdAt,
            parentFolderId: folder.parentFolderId,
            lastOpenedAt: folder.lastOpenedAt,
            isPrivatelyLocked: folder.isPrivatelyLocked,
        } ).from( folder )
            .where( and(
                eq( folder.userId, userId ),
                eq( folder.isDeleted, false ),
                isNull( folder.virtualBucketId ),
                EXCLUDE_VIRTUAL_BUCKET_FOLDERS,
                gte( folder.lastOpenedAt, cutoff )
            ) )
            .orderBy( desc( folder.lastOpenedAt ) )
            .limit( 50 ),
        db.select( {
            id: storageFile.id,
            name: storageFile.name,
            sizeInBytes: storageFile.sizeInBytes,
            mimeType: storageFile.mimeType,
            createdAt: storageFile.createdAt,
            lastOpenedAt: storageFile.lastOpenedAt,
            isPrivatelyLocked: storageFile.isPrivatelyLocked,
        } ).from( storageFile )
            .where( and(
                eq( storageFile.userId, userId ),
                eq( storageFile.isDeleted, false ),
                gte( storageFile.lastOpenedAt, cutoff )
            ) )
            .orderBy( desc( storageFile.lastOpenedAt ) )
            .limit( 50 ),
    ] )

    return { folders, files }
}
