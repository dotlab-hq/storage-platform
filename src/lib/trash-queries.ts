import { eq, and } from "drizzle-orm"

export type TrashItem = {
    id: string
    name: string
    type: "file" | "folder"
    deletedAt: string | null
    sizeInBytes?: number
    mimeType?: string | null
}

export async function listTrashItems( userId: string ): Promise<TrashItem[]> {
    const [{ db }, { file: storageFile, folder }] = await Promise.all( [
        import( "@/db" ),
        import( "@/db/schema/storage" ),
    ] )

    const [deletedFiles, deletedFolders] = await Promise.all( [
        db.select( {
            id: storageFile.id,
            name: storageFile.name,
            deletedAt: storageFile.deletedAt,
            sizeInBytes: storageFile.sizeInBytes,
            mimeType: storageFile.mimeType,
        } )
            .from( storageFile )
            .where( and( eq( storageFile.userId, userId ), eq( storageFile.isDeleted, true ) ) ),
        db.select( {
            id: folder.id,
            name: folder.name,
            deletedAt: folder.deletedAt,
        } )
            .from( folder )
            .where( and( eq( folder.userId, userId ), eq( folder.isDeleted, true ) ) ),
    ] )

    const items: TrashItem[] = [
        ...deletedFolders.map( ( f ) => ( {
            id: f.id,
            name: f.name,
            type: "folder" as const,
            deletedAt: f.deletedAt?.toISOString() ?? null,
        } ) ),
        ...deletedFiles.map( ( f ) => ( {
            id: f.id,
            name: f.name,
            type: "file" as const,
            deletedAt: f.deletedAt?.toISOString() ?? null,
            sizeInBytes: f.sizeInBytes,
            mimeType: f.mimeType,
        } ) ),
    ]

    // Sort by deletedAt descending (most recently deleted first)
    items.sort( ( a, b ) => {
        const da = a.deletedAt ? new Date( a.deletedAt ).getTime() : 0
        const db2 = b.deletedAt ? new Date( b.deletedAt ).getTime() : 0
        return db2 - da
    } )

    return items
}
