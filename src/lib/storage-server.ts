import { and, eq, isNull } from "drizzle-orm"

const BUCKET_NAME = "dot-storage"

type UploadFileInput = {
    userId: string
    file: File
    parentFolderId?: string | null
}

export async function uploadSingleFile( {
    userId,
    file,
    parentFolderId = null,
}: UploadFileInput ) {
    const { PutObjectCommand, S3Client } = await import( "@aws-sdk/client-s3" )
    const [{ db }, { file: storageFile, folder }] = await Promise.all( [
        import( "@/db" ),
        import( "@/db/schema/storage" ),
    ] )

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

    console.log( `[Server] Starting upload for file: ${file.name} (${file.size} bytes)` )

    const extension = file.name.includes( "." )
        ? file.name.split( "." ).pop()
        : "bin"
    const objectKey = `${userId}/${crypto.randomUUID()}.${extension}`
    const fileBytes = new Uint8Array( await file.arrayBuffer() )

    console.log( `[Server] S3 Key: ${objectKey}, Bucket: ${BUCKET_NAME}` )
    console.log( `[Server] S3 region: ${process.env.S3_REGION}, endpoint: ${process.env.S3_ENDPOINT}` )

    await s3Client.send(
        new PutObjectCommand( {
            Bucket: BUCKET_NAME,
            Key: objectKey,
            Body: fileBytes,
            ContentLength: fileBytes.byteLength,
            ContentType: file.type || "application/octet-stream",
        } )
    )

    console.log( `[Server] S3 upload successful for: ${file.name}` )

    let isPrivatelyLocked = false
    if ( parentFolderId ) {
        const parentRows = await db.select( { isPrivatelyLocked: folder.isPrivatelyLocked } )
            .from( folder )
            .where( and( eq( folder.id, parentFolderId ), eq( folder.userId, userId ) ) )
            .limit( 1 )
        if ( parentRows.length > 0 ) {
            isPrivatelyLocked = parentRows[0].isPrivatelyLocked
        }
    }

    const [insertedFile] = await db
        .insert( storageFile )
        .values( {
            name: file.name,
            objectKey,
            mimeType: file.type || null,
            sizeInBytes: file.size,
            userId,
            folderId: parentFolderId,
            isPrivatelyLocked,
        } )
        .returning( {
            id: storageFile.id,
            name: storageFile.name,
            createdAt: storageFile.createdAt,
        } )

    console.log( `[Server] DB insert successful` )
    return insertedFile
}

type CreateFolderInput = {
    userId: string
    name: string
    parentFolderId?: string | null
}

export async function createNewFolder( {
    userId,
    name,
    parentFolderId = null,
}: CreateFolderInput ) {
    const [{ db }, { folder }] = await Promise.all( [
        import( "@/db" ),
        import( "@/db/schema/storage" ),
    ] )

    // Find existing folder names in the same directory to handle duplicates
    const siblings = await db
        .select( { name: folder.name } )
        .from( folder )
        .where(
            parentFolderId
                ? and( eq( folder.userId, userId ), eq( folder.parentFolderId, parentFolderId ), eq( folder.isDeleted, false ) )
                : and( eq( folder.userId, userId ), isNull( folder.parentFolderId ), eq( folder.isDeleted, false ) )
        )

    const siblingNames = new Set( siblings.map( ( s ) => s.name ) )
    let finalName = name
    if ( siblingNames.has( finalName ) ) {
        let counter = 1
        while ( siblingNames.has( `${name} (${counter})` ) ) {
            counter++
        }
        finalName = `${name} (${counter})`
    }

    const [created] = await db
        .insert( folder )
        .values( {
            name: finalName,
            userId,
            parentFolderId,
            isPrivatelyLocked: false,
        } )
        .returning( {
            id: folder.id,
            name: folder.name,
            createdAt: folder.createdAt,
        } )

    return created
}

export async function listRootItems( userId: string ) {
    const [{ db }, { file: storageFile, folder }] = await Promise.all( [
        import( "@/db" ),
        import( "@/db/schema/storage" ),
    ] )

    const rootFolders = await db
        .select( {
            id: folder.id,
            name: folder.name,
            createdAt: folder.createdAt,
            isPrivatelyLocked: folder.isPrivatelyLocked,
        } )
        .from( folder )
        .where( and( eq( folder.userId, userId ), isNull( folder.parentFolderId ), eq( folder.isDeleted, false ) ) )
        .orderBy( folder.createdAt )

    const rootFiles = await db
        .select( {
            id: storageFile.id,
            name: storageFile.name,
            sizeInBytes: storageFile.sizeInBytes,
            createdAt: storageFile.createdAt,
            isPrivatelyLocked: storageFile.isPrivatelyLocked,
        } )
        .from( storageFile )
        .where( and( eq( storageFile.userId, userId ), isNull( storageFile.folderId ), eq( storageFile.isDeleted, false ) ) )
        .orderBy( storageFile.createdAt )

    return {
        folders: rootFolders,
        files: rootFiles,
    }
}
