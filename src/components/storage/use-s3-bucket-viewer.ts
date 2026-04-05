import { useMemo, useRef, useState } from "react"
import {
    createS3ViewerFolderFn,
    createS3ViewerPresignUrlFn,
    deleteS3ViewerObjectFn,
    getS3ViewerCredentialsFn,
    listS3ViewerObjectsFn,
    uploadS3ViewerObjectFn,
} from "@/lib/storage/mutations/s3-viewer"
import type { S3ViewerFileEntry, S3ViewerFolderEntry } from "@/components/storage/s3-bucket-viewer-cards"

function toBase64( bytes: ArrayBuffer ): string {
    let binary = ""
    for ( const byte of new Uint8Array( bytes ) ) {
        binary += String.fromCharCode( byte )
    }
    return btoa( binary )
}

export function useS3BucketViewer( bucketName: string ) {
    const [prefix, setPrefix] = useState( "" )
    const [folders, setFolders] = useState<S3ViewerFolderEntry[]>( [] )
    const [files, setFiles] = useState<S3ViewerFileEntry[]>( [] )
    const [busy, setBusy] = useState( false )
    const [message, setMessage] = useState<string | null>( null )
    const inputRef = useRef<HTMLInputElement | null>( null )

    const breadcrumbs = useMemo( () => {
        const parts = prefix.split( "/" ).filter( ( part ) => part.length > 0 )
        return parts.map( ( part, index ) => ( {
            label: part,
            value: `${parts.slice( 0, index + 1 ).join( "/" )}/`,
        } ) )
    }, [prefix] )

    const refresh = async ( nextPrefix?: string ) => {
        const targetPrefix = typeof nextPrefix === "string" ? nextPrefix : prefix
        setBusy( true )
        setMessage( null )
        try {
            const result = await listS3ViewerObjectsFn( {
                data: { bucketName, prefix: targetPrefix, maxKeys: 500 },
            } )
            setPrefix( result.prefix )
            setFolders( result.folders )
            setFiles( result.objects )
        } catch ( error ) {
            setMessage( error instanceof Error ? error.message : "Failed to load bucket content" )
        } finally {
            setBusy( false )
        }
    }

    const handleUpload = async ( event: React.ChangeEvent<HTMLInputElement> ) => {
        const file = event.target.files?.[0]
        if ( !file ) return
        setBusy( true )
        setMessage( null )
        try {
            const bytes = await file.arrayBuffer()
            await uploadS3ViewerObjectFn( {
                data: {
                    bucketName,
                    objectKey: `${prefix}${file.name}`,
                    contentBase64: toBase64( bytes ),
                    contentType: file.type,
                },
            } )
            await refresh()
            setMessage( `Uploaded ${file.name}` )
        } catch ( error ) {
            setMessage( error instanceof Error ? error.message : "Upload failed" )
        } finally {
            setBusy( false )
            event.target.value = ""
        }
    }

    const createFolder = async () => {
        const folderName = window.prompt( "Folder name" )?.trim()
        if ( !folderName ) return
        setBusy( true )
        setMessage( null )
        try {
            await createS3ViewerFolderFn( { data: { bucketName, objectKey: `${prefix}${folderName}/` } } )
            await refresh()
        } catch ( error ) {
            setMessage( error instanceof Error ? error.message : "Failed to create folder" )
        } finally {
            setBusy( false )
        }
    }

    const deleteFile = async ( key: string ) => {
        if ( !window.confirm( `Delete ${key}?` ) ) return
        setBusy( true )
        setMessage( null )
        try {
            await deleteS3ViewerObjectFn( { data: { bucketName, objectKey: key } } )
            await refresh()
        } catch ( error ) {
            setMessage( error instanceof Error ? error.message : "Delete failed" )
        } finally {
            setBusy( false )
        }
    }

    const openFile = async ( key: string ) => {
        setBusy( true )
        setMessage( null )
        try {
            const result = await createS3ViewerPresignUrlFn( {
                data: { bucketName, objectKey: key, expiresInSeconds: 900 },
            } )
            window.open( result.url, "_blank", "noopener,noreferrer" )
        } catch ( error ) {
            setMessage( error instanceof Error ? error.message : "Failed to open file" )
        } finally {
            setBusy( false )
        }
    }

    const showCredentials = async () => {
        setBusy( true )
        setMessage( null )
        try {
            const credentials = await getS3ViewerCredentialsFn( { data: { bucketName } } )
            setMessage( `${credentials.endpoint}/api/storage/s3\n${credentials.accessKeyId}\n${credentials.secretAccessKey}` )
        } catch ( error ) {
            setMessage( error instanceof Error ? error.message : "Failed to load credentials" )
        } finally {
            setBusy( false )
        }
    }

    return {
        inputRef,
        prefix,
        folders,
        files,
        busy,
        message,
        breadcrumbs,
        setPrefix,
        refresh,
        handleUpload,
        createFolder,
        deleteFile,
        openFile,
        showCredentials,
    }
}
