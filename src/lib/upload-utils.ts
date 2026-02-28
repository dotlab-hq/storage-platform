import type { UploadingFile } from "@/types/storage"
import type React from "react"

type UploadStateUpdater = React.Dispatch<React.SetStateAction<UploadingFile[]>>

type PresignResponse = { presignedUrl?: string; error?: string }
type RegisterResponse = { file?: { id: string; name: string }; error?: string }

/**
 * Get a presigned URL for uploading a file to S3.
 */
async function fetchPresignedUrl(
    userId: string,
    objectKey: string,
    contentType: string,
    fileSize: number
): Promise<string> {
    const res = await fetch( "/api/storage/upload-presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify( { userId, objectKey, contentType, fileSize } ),
    } )
    const data = ( await res.json() ) as PresignResponse
    if ( !res.ok || !data.presignedUrl ) {
        throw new Error( data.error ?? "Failed to get presigned URL" )
    }
    return data.presignedUrl
}

/**
 * Register an uploaded file in the database.
 */
async function registerFileInDb(
    userId: string,
    fileName: string,
    objectKey: string,
    mimeType: string,
    fileSize: number,
    parentFolderId: string | null
): Promise<void> {
    const res = await fetch( "/api/storage/register-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify( { userId, fileName, objectKey, mimeType, fileSize, parentFolderId } ),
    } )
    const data = ( await res.json() ) as RegisterResponse
    if ( !res.ok || data.error ) {
        throw new Error( data.error ?? "Failed to register file" )
    }
}

/**
 * Upload a single file directly to S3 using a presigned URL.
 * 1. Get presigned URL from server
 * 2. PUT file directly to S3
 * 3. Register file metadata in database
 */
export async function uploadFileToS3(
    file: File,
    userId: string,
    folderId: string | null,
    onProgress: ( progress: number ) => void
): Promise<void> {
    if ( !userId ) {
        throw new Error( "User ID is required for upload" )
    }

    const extension = file.name.includes( "." )
        ? file.name.split( "." ).pop()
        : "bin"
    const objectKey = `${userId}/${crypto.randomUUID()}.${extension}`
    const contentType = file.type || "application/octet-stream"

    // Step 1: Get presigned URL
    const presignedUrl = await fetchPresignedUrl( userId, objectKey, contentType, file.size )

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

    // Step 3: Register file in database
    await registerFileInDb( userId, file.name, objectKey, contentType, file.size, folderId )
}

/**
 * Upload a batch of files with a concurrency limit (default 3).
 * Progress / status updates are pushed to the global uploads state.
 * Returns the number of successfully uploaded files.
 */
export async function uploadBatch(
    files: { id: string; file: File }[],
    userId: string,
    folderId: string | null,
    concurrency: number,
    setUploads: UploadStateUpdater
): Promise<number> {
    let completed = 0
    const queue = [...files]

    const worker = async () => {
        while ( queue.length > 0 ) {
            const task = queue.shift()
            if ( !task ) break
            try {
                await uploadFileToS3( task.file, userId, folderId, ( progress ) => {
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
