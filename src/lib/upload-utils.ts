import type { UploadingFile } from "@/types/storage"
import type React from "react"

type UploadStateUpdater = React.Dispatch<React.SetStateAction<UploadingFile[]>>

type PresignResponse = { presignedUrl?: string; providerId?: string | null; error?: string }
type RegisterResponse = { file?: { id: string; name: string; mimeType: string | null; sizeInBytes: number; objectKey: string }; error?: string }

export type CompletedFileInfo = {
    id: string
    name: string
    mimeType: string | null
    sizeInBytes: number
    objectKey: string
    createdAt: Date
}

/**
 * Get a presigned URL for uploading a file to S3.
 */
async function fetchPresignedUrl(
    objectKey: string,
    contentType: string,
    fileSize: number
): Promise<{ presignedUrl: string; providerId: string | null }> {
    const res = await fetch( "/api/storage/upload-presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify( { objectKey, contentType, fileSize } ),
    } )
    const data = ( await res.json() ) as PresignResponse
    if ( !res.ok || !data.presignedUrl ) {
        throw new Error( data.error ?? "Failed to get presigned URL" )
    }
    return { presignedUrl: data.presignedUrl, providerId: data.providerId ?? null }
}

/**
 * Register an uploaded file in the database.
 * Returns the newly-created file record.
 */
async function registerFileInDb(
    fileName: string,
    objectKey: string,
    mimeType: string,
    fileSize: number,
    parentFolderId: string | null,
    providerId: string | null
): Promise<CompletedFileInfo> {
    const res = await fetch( "/api/storage/register-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify( { fileName, objectKey, mimeType, fileSize, parentFolderId, providerId } ),
    } )
    const data = ( await res.json() ) as RegisterResponse
    if ( !res.ok || data.error || !data.file ) {
        throw new Error( data.error ?? "Failed to register file" )
    }
    return {
        id: data.file.id,
        name: data.file.name,
        mimeType: data.file.mimeType,
        sizeInBytes: data.file.sizeInBytes,
        objectKey: data.file.objectKey,
        createdAt: new Date(),
    }
}

/**
 * Upload a single file directly to S3 using a presigned URL.
 * Returns the registered file record for optimistic UI updates.
 */
export async function uploadFileToS3(
    file: File,
    userId: string,
    folderId: string | null,
    onProgress: ( progress: number ) => void
): Promise<CompletedFileInfo> {
    if ( !userId ) {
        throw new Error( "User ID is required for upload" )
    }

    const dotIndex = file.name.lastIndexOf( "." )
    const base = ( dotIndex > 0 ? file.name.slice( 0, dotIndex ) : file.name )
        .replace( /\s+/g, "_" )
        .replace( /[^a-zA-Z0-9._-]/g, "" ) || "file"
    const ext = dotIndex > 0
        ? `.${file.name.slice( dotIndex + 1 ).replace( /[^a-zA-Z0-9]/g, "" )}`
        : ""
    const objectKey = `${userId}/${crypto.randomUUID()}-${base}${ext}`
    const contentType = file.type || "application/octet-stream"

    // Step 1: Get presigned URL
    const { presignedUrl, providerId } = await fetchPresignedUrl( objectKey, contentType, file.size )

    // Step 2: Upload directly to S3
    await new Promise<void>( ( resolve, reject ) => {
        const xhr = new XMLHttpRequest()

        xhr.upload.onprogress = ( e ) => {
            if ( e.lengthComputable ) {
                onProgress( Math.round( ( e.loaded / e.total ) * 100 ) )
            }
        }

        xhr.onload = () => {
            if ( xhr.status >= 200 && xhr.status < 300 ) {
                resolve()
            } else {
                reject( new Error( `S3 upload failed: HTTP ${xhr.status}` ) )
            }
        }

        xhr.onerror = () => reject( new Error( "Network error during S3 upload" ) )
        xhr.open( "PUT", presignedUrl )
        xhr.setRequestHeader( "Content-Type", contentType )
        xhr.send( file )
    } )

    // Step 3: Register file in database and return file info
    return registerFileInDb( file.name, objectKey, contentType, file.size, folderId, providerId )
}

/**
 * Upload a batch of files with a concurrency limit (default 3).
 * Progress / status updates are pushed to the global uploads state.
 * Calls onFileUploaded after each successful upload for optimistic UI.
 * Returns the number of successfully uploaded files.
 */
export async function uploadBatch(
    files: { id: string; file: File }[],
    userId: string,
    folderId: string | null,
    concurrency: number,
    setUploads: UploadStateUpdater,
    onFileUploaded?: ( file: CompletedFileInfo ) => void
): Promise<number> {
    let completed = 0
    const queue = [...files]

    const worker = async () => {
        while ( queue.length > 0 ) {
            const task = queue.shift()
            if ( !task ) break
            try {
                const fileInfo = await uploadFileToS3( task.file, userId, folderId, ( progress ) => {
                    setUploads( ( prev ) =>
                        prev.map( ( u ) =>
                            u.id === task.id ? { ...u, progress } : u
                        )
                    )
                } )
                setUploads( ( prev ) =>
                    prev.map( ( u ) =>
                        u.id === task.id
                            ? { ...u, progress: 100, status: "completed" as const }
                            : u
                    )
                )
                onFileUploaded?.( fileInfo )
                completed++
                setTimeout( () => {
                    setUploads( ( prev ) => prev.filter( ( u ) => u.id !== task.id ) )
                }, 1500 )
            } catch ( err ) {
                const msg = err instanceof Error ? err.message : String( err )
                setUploads( ( prev ) =>
                    prev.map( ( u ) =>
                        u.id === task.id
                            ? { ...u, status: "failed" as const, error: msg }
                            : u
                    )
                )
            }
        }
    }

    const workerCount = Math.min( concurrency, files.length )
    await Promise.all(
        Array.from( { length: workerCount }, () => worker() )
    )
    return completed
}
