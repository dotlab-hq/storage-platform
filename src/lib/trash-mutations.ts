import { eq, and } from "drizzle-orm"

export async function restoreItems(
    userId: string,
    itemIds: string[],
    itemTypes: ( "file" | "folder" )[]
) {
    const [{ db }, { file: storageFile, folder }] = await Promise.all( [
        import( "@/db" ),
        import( "@/db/schema/storage" ),
    ] )

    const fileIds: string[] = []
    const folderIds: string[] = []
    for ( let i = 0; i < itemIds.length; i++ ) {
        if ( itemTypes[i] === "file" ) fileIds.push( itemIds[i] )
        else folderIds.push( itemIds[i] )
    }

    await Promise.all( [
        ...fileIds.map( ( id ) =>
            db.update( storageFile )
                .set( { isDeleted: false, deletedAt: null } )
                .where( and( eq( storageFile.id, id ), eq( storageFile.userId, userId ) ) )
        ),
        ...folderIds.map( ( id ) =>
            db.update( folder )
                .set( { isDeleted: false, deletedAt: null } )
                .where( and( eq( folder.id, id ), eq( folder.userId, userId ) ) )
        ),
    ] )

    return { restored: itemIds.length }
}

export async function permanentDeleteItems(
    userId: string,
    itemIds: string[],
    itemTypes: ( "file" | "folder" )[]
) {
    const [{ db }, { file: storageFile, folder, userStorage }] = await Promise.all( [
        import( "@/db" ),
        import( "@/db/schema/storage" ),
    ] )

    const { DeleteObjectCommand, S3Client } = await import( "@aws-sdk/client-s3" )

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

    const fileIds: string[] = []
    const folderIds: string[] = []
    for ( let i = 0; i < itemIds.length; i++ ) {
        if ( itemTypes[i] === "file" ) fileIds.push( itemIds[i] )
        else folderIds.push( itemIds[i] )
    }

    let freedBytes = 0

    // Delete files from S3 + DB
    for ( const id of fileIds ) {
        const [row] = await db.select( {
            objectKey: storageFile.objectKey,
            sizeInBytes: storageFile.sizeInBytes,
        } )
            .from( storageFile )
            .where( and( eq( storageFile.id, id ), eq( storageFile.userId, userId ) ) )
            .limit( 1 )

        if ( row ) {
            try {
                await s3Client.send( new DeleteObjectCommand( {
                    Bucket: "dot-storage",
                    Key: row.objectKey,
                } ) )
            } catch ( err ) {
                console.error( `[Server] S3 delete failed for key=${row.objectKey}:`, err )
            }
            freedBytes += row.sizeInBytes
            await db.delete( storageFile )
                .where( and( eq( storageFile.id, id ), eq( storageFile.userId, userId ) ) )
        }
    }

    // Delete folders from DB
    for ( const id of folderIds ) {
        await db.delete( folder )
            .where( and( eq( folder.id, id ), eq( folder.userId, userId ) ) )
    }

    // Update used storage
    if ( freedBytes > 0 ) {
        const [currentStorage] = await db.select( { usedStorage: userStorage.usedStorage } )
            .from( userStorage )
            .where( eq( userStorage.userId, userId ) )
            .limit( 1 )

        if ( currentStorage ) {
            const newUsed = Math.max( 0, currentStorage.usedStorage - freedBytes )
            await db.update( userStorage )
                .set( { usedStorage: newUsed } )
                .where( eq( userStorage.userId, userId ) )
        }
    }

    return { deletedFiles: fileIds.length, deletedFolders: folderIds.length, freedBytes }
}
