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
    // Generate object key
    const extension = file.name.includes( "." )
        ? file.name.split( "." ).pop()
        : "bin"
    const objectKey = `${userId}/${crypto.randomUUID()}.${extension}`

    // Get presigned URL from server
    const { presignedUrl } = await getS3PresignedUrl( {
        userId,
        objectKey,
        contentType: file.type || "application/octet-stream",
        fileSize: file.size,
    } )

    // Upload directly to S3
    return new Promise( ( resolve, reject ) => {
        const xhr = new XMLHttpRequest()

        xhr.upload.onprogress = ( e ) => {
            if ( e.lengthComputable ) {
                onProgress( Math.round( ( e.loaded / e.total ) * 100 ) )
            }
        }

        xhr.onload = () => {
            if ( xhr.status >= 200 && xhr.status < 300 ) {
                // Register the file in the database
                registerUploadedFile( {
                    userId,
                    fileName: file.name,
                    objectKey,
                    mimeType: file.type || "application/octet-stream",
                    fileSize: file.size,
                    parentFolderId: folderId,
                } ).then( () => resolve() ).catch( reject )
            } else {
                reject( new Error( `S3 upload failed: HTTP ${xhr.status}` ) )
            }
        }

        xhr.onerror = () => reject( new Error( "Network error during S3 upload" ) )
        xhr.open( "PUT", presignedUrl )
        xhr.setRequestHeader( "Content-Type", file.type || "application/octet-stream" )
        xhr.send( file )
    } )
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
