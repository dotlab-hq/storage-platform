import type { UploadingFile } from "@/types/storage"

type UploadStateUpdater = React.Dispatch<React.SetStateAction<UploadingFile[]>>

/**
 * Upload a single file via XMLHttpRequest so we get real `progress` events.
 */
export function uploadFileXHR(
    file: File,
    userId: string,
    folderId: string | null,
    onProgress: ( progress: number ) => void
): Promise<void> {
    return new Promise( ( resolve, reject ) => {
        const xhr = new XMLHttpRequest()
        const fd = new FormData()
        fd.append( "userId", userId )
        fd.append( "file", file )
        if ( folderId ) fd.append( "parentFolderId", folderId )

        xhr.upload.onprogress = ( e ) => {
            if ( e.lengthComputable ) {
                onProgress( Math.round( ( e.loaded / e.total ) * 100 ) )
            }
        }

        xhr.onload = () => {
            if ( xhr.status >= 200 && xhr.status < 300 ) {
                resolve()
            } else {
                try {
                    const data = JSON.parse( xhr.responseText ) as { error?: string }
                    reject( new Error( data.error ?? `HTTP ${xhr.status}` ) )
                } catch {
                    reject( new Error( `HTTP ${xhr.status}` ) )
                }
            }
        }

        xhr.onerror = () => reject( new Error( "Network error" ) )
        xhr.open( "POST", "/api/upload" )
        xhr.send( fd )
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
                await uploadFileXHR( task.file, userId, folderId, ( progress ) => {
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
