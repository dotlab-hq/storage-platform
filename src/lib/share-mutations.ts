import { eq, and } from "drizzle-orm"

export async function createShareLink(
    userId: string,
    itemId: string,
    itemType: "file" | "folder",
    requiresAuth: boolean
) {
    const [{ db }, { shareLink }] = await Promise.all( [
        import( "@/db" ),
        import( "@/db/schema/storage" ),
    ] )

    // Check if an active share link already exists for this item
    const existing = await db.select().from( shareLink ).where(
        itemType === "file"
            ? and( eq( shareLink.fileId, itemId ), eq( shareLink.sharedByUserId, userId ) )
            : and( eq( shareLink.folderId, itemId ), eq( shareLink.sharedByUserId, userId ) )
    ).limit( 1 )

    if ( existing.length > 0 ) {
        // Update existing link
        const [updated] = await db.update( shareLink )
            .set( { requiresAuth, isActive: true } )
            .where( eq( shareLink.id, existing[0].id ) )
            .returning()
        return updated
    }

    const token = generateShareToken()
    const [created] = await db.insert( shareLink ).values( {
        fileId: itemType === "file" ? itemId : null,
        folderId: itemType === "folder" ? itemId : null,
        sharedByUserId: userId,
        shareToken: token,
        requiresAuth,
    } ).returning()

    return created
}

export async function getShareLink( userId: string, itemId: string, itemType: "file" | "folder" ) {
    const [{ db }, { shareLink }] = await Promise.all( [
        import( "@/db" ),
        import( "@/db/schema/storage" ),
    ] )

    const [row] = await db.select().from( shareLink ).where(
        itemType === "file"
            ? and( eq( shareLink.fileId, itemId ), eq( shareLink.sharedByUserId, userId ) )
            : and( eq( shareLink.folderId, itemId ), eq( shareLink.sharedByUserId, userId ) )
    ).limit( 1 )

    return row ?? null
}

export async function toggleShareLink( userId: string, linkId: string, isActive: boolean ) {
    const [{ db }, { shareLink }] = await Promise.all( [
        import( "@/db" ),
        import( "@/db/schema/storage" ),
    ] )

    const [updated] = await db.update( shareLink )
        .set( { isActive } )
        .where( and( eq( shareLink.id, linkId ), eq( shareLink.sharedByUserId, userId ) ) )
        .returning()

    return updated ?? null
}

export async function updateShareAuth( userId: string, linkId: string, requiresAuth: boolean ) {
    const [{ db }, { shareLink }] = await Promise.all( [
        import( "@/db" ),
        import( "@/db/schema/storage" ),
    ] )

    const [updated] = await db.update( shareLink )
        .set( { requiresAuth } )
        .where( and( eq( shareLink.id, linkId ), eq( shareLink.sharedByUserId, userId ) ) )
        .returning()

    return updated ?? null
}

export async function deleteShareLink( userId: string, linkId: string ) {
    const [{ db }, { shareLink }] = await Promise.all( [
        import( "@/db" ),
        import( "@/db/schema/storage" ),
    ] )

    await db.delete( shareLink )
        .where( and( eq( shareLink.id, linkId ), eq( shareLink.sharedByUserId, userId ) ) )
}

function generateShareToken(): string {
    const bytes = new Uint8Array( 24 )
    crypto.getRandomValues( bytes )
    return Array.from( bytes ).map( ( b ) => b.toString( 36 ).padStart( 2, "0" ) ).join( "" ).slice( 0, 32 )
}
