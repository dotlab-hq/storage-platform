import type { UploadingFile } from "@/types/storage"
import { getS3PresignedUrl, registerUploadedFile } from "@/lib/s3-functions"
import type React from "react"

type UploadStateUpdater = React.Dispatch<React.SetStateAction<UploadingFile[]>>

/**
 * Upload a single file directly to S3 using a presigned URL.
 */
export async function uploadFileToS3(
    file: File,
    userId: string,
    folderId: string | null,
    onProgress: ( progress: number ) => void
): Promise<void> {
    if ( !userId ) {
        throw new Error( 'User ID is required for upload' )
    }

    // Generate object key
    const extension = file.name.includes( "." )
        ? file.name.split( "." ).pop()
        : "bin"
    const objectKey = `${userId}/${crypto.randomUUID()}.${extension}`

    console.log( '[Upload] Requesting presigned URL for:', objectKey )

    try {
        // Get presigned URL from server
        const result = await getS3PresignedUrl( {
            userId,
            objectKey,
            contentType: file.type || "application/octet-stream",
            fileSize: file.size,
        } )

        if ( !result || !result.presignedUrl ) {
            throw new Error( 'Failed to get presigned URL' )
        }

        const { presignedUrl } = result
        console.log( '[Upload] Got presigned URL, uploading to S3' )

        // Upload directly to S3
        return new Promise( ( resolve, reject ) => {
            const xhr = new XMLHttpRequest()

            xhr.upload.onprogress = ( e ) => {
                if ( e.lengthComputable ) {
                    onProgress( Math.round( ( e.loaded / e.total ) * 100 ) )
                }
            }

            xhr.onload = async () => {
                console.log( '[Upload] S3 upload completed with status:', xhr.status )
                if ( xhr.status >= 200 && xhr.status < 300 ) {
                    // Register the file in the database
                    try {
                        console.log( '[Upload] Registering file in database' )
                        await registerUploadedFile( {
                            userId,
                            fileName: file.name,
                            objectKey,
                            mimeType: file.type || "application/octet-stream",
                            fileSize: file.size,
                            parentFolderId: folderId,
                        } )
                        console.log( '[Upload] File registration successful' )
                        resolve()
                    } catch ( err ) {
                        console.error( '[Upload] File registration failed:', err )
                        reject( new Error( `Failed to register file: ${err instanceof Error ? err.message : String( err )}` ) )
                    }
                } else {
                    reject( new Error( `S3 upload failed: HTTP ${xhr.status}` ) )
                }
            }

            xhr.onerror = () => {
                console.error( '[Upload] XHR error during S3 upload' )
                reject( new Error( "Network error during S3 upload" ) )
            }

            console.log( '[Upload] Starting XHR PUT request' )
            xhr.open( "PUT", presignedUrl )
            xhr.setRequestHeader( "Content-Type", file.type || "application/octet-stream" )
            xhr.send( file )
        } )
    } catch ( err ) {
        console.error( '[Upload] Error:', err )
        throw err
    }
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
