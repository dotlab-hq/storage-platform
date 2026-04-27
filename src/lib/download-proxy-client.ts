import { readErrorBody } from '@/lib/upload-proxy-client-shared'

export type DownloadProgressCallback = ( loaded: number, total: number ) => void

export interface ProxyDownloadOptions {
    downloadUrl: string
    providerId: string | null
    objectKey: string
    onProgress?: DownloadProgressCallback
    rangeStart?: number
    rangeEnd?: number
}

function getErrorMessage( error: unknown, fallback: string ): string {
    return error instanceof Error ? error.message : fallback
}

export async function downloadViaProxy(
    options: ProxyDownloadOptions,
): Promise<ReadableStream<Uint8Array>> {
    const {
        downloadUrl,
        providerId,
        objectKey,
        onProgress,
        rangeStart,
        rangeEnd,
    } = options

    const headers: Record<string, string> = {
        'X-Download-Object-Key': objectKey,
        'X-Download-Provider-Id': providerId ?? '',
    }

    // Add range header if specified
    if ( rangeStart !== undefined && rangeEnd !== undefined ) {
        headers['Range'] = `bytes=${rangeStart}-${rangeEnd}`
    }

    const response = await fetch( downloadUrl, {
        method: 'GET',
        headers,
    } )

    if ( !response.ok ) {
        const errorBody = await readErrorBody( response )
        throw new Error(
            `Proxy download failed: HTTP ${response.status} - ${errorBody}`,
        )
    }

    const contentLength = response.headers.get( 'Content-Length' )
    const total = contentLength ? parseInt( contentLength, 10 ) : 0

    if ( !response.body ) {
        throw new Error( 'No response body from proxy download' )
    }

    // If we have a progress callback and total is known, wrap the stream
    if ( onProgress && total > 0 ) {
        return wrapStreamWithProgress( response.body, onProgress, total )
    }

    return response.body
}

function wrapStreamWithProgress(
    stream: ReadableStream<Uint8Array>,
    onProgress: DownloadProgressCallback,
    total: number,
): ReadableStream<Uint8Array> {
    let loaded = 0

    return new ReadableStream( {
        async start( controller ) {
            onProgress( 0, total )
        },
        async pull( controller ) {
            const reader = stream.getReader()
            try {
                const { done, value } = await reader.read()
                if ( done ) {
                    controller.close()
                    onProgress( total, total )
                    return
                }
                loaded += value.byteLength
                onProgress( Math.min( loaded, total ), total )
                controller.enqueue( value )
            } finally {
                reader.releaseLock()
            }
        },
        cancel() {
            stream.cancel()
        },
    } )
}

export async function downloadProxyChunk( args: {
    downloadUrl: string
    providerId: string | null
    objectKey: string
    start: number
    end: number
    onProgress: ( loaded: number ) => void
} ): Promise<Blob> {
    const { downloadUrl, providerId, objectKey, start, end, onProgress } = args

    const response = await fetch( downloadUrl, {
        method: 'GET',
        headers: {
            'X-Download-Object-Key': objectKey,
            'X-Download-Provider-Id': providerId ?? '',
            'Range': `bytes=${start}-${end}`,
        },
    } )

    if ( !response.ok ) {
        const errorBody = await readErrorBody( response )
        throw new Error(
            `Proxy chunk download failed: HTTP ${response.status} - ${errorBody}`,
        )
    }

    const reader = response.body?.getReader()
    if ( !reader ) {
        throw new Error( 'No response body stream' )
    }

    const chunks: Uint8Array[] = []
    let loaded = 0

    try {
        for ( ; ; ) {
            const { done, value } = await reader.read()
            if ( done ) break
            chunks.push( value )
            loaded += value.byteLength
            onProgress( loaded )
        }
    } finally {
        reader.releaseLock()
    }

    // Combine all chunks into a single blob
    const totalLength = chunks.reduce( ( acc, chunk ) => acc + chunk.byteLength, 0 )
    const combined = new Uint8Array( totalLength )
    let offset = 0
    for ( const chunk of chunks ) {
        combined.set( chunk, offset )
        offset += chunk.byteLength
    }

    return new Blob( [combined] )
}