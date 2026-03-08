import { useEffect, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { FileText, Folder, Loader2, Link2Off, Download } from "lucide-react"
import { toast } from "@/components/ui/sonner"
import {
    getShareByToken,
    getSharedFilePresignedUrl,
    getSharedFileDownloadUrl,
} from "@/lib/share-queries"

type FileShareData = {
    type: "file"
    name: string
    mimeType: string | null
    sizeInBytes: number
    presignedUrl: string
}

type FolderShareData = {
    type: "folder"
    name: string
    folderId: string
}

type ShareData = FileShareData | FolderShareData

type FileItem = {
    id: string
    name: string
    mimeType: string | null
    sizeInBytes: number
    objectKey: string
}

type FolderItem = { id: string; name: string }

const getShareAccessFn = createServerFn( { method: "GET" } )
    .inputValidator( z.object( { token: z.string() } ) )
    .handler( async ( { data } ) => {
        const result = await getShareByToken( data.token )
        if ( !result || !result.item ) throw new Error( "Share link not found or expired" )

        if ( result.type === "file" ) {
            const fileItem = result.item as FileItem
            const presignedUrl = await getSharedFilePresignedUrl( fileItem.objectKey, fileItem.name )
            return {
                type: "file" as const,
                name: fileItem.name,
                mimeType: fileItem.mimeType,
                sizeInBytes: fileItem.sizeInBytes,
                presignedUrl,
            }
        }

        const folderItem = result.item as FolderItem
        return { type: "folder" as const, name: folderItem.name, folderId: folderItem.id }
    } )

const getShareDownloadUrlFn = createServerFn( { method: "GET" } )
    .inputValidator( z.object( { token: z.string() } ) )
    .handler( async ( { data } ) => {
        const result = await getShareByToken( data.token )
        if ( !result || !result.item || result.type !== "file" ) {
            throw new Error( "File not found or invalid share link" )
        }
        const fileItem = result.item as FileItem
        const url = await getSharedFileDownloadUrl( fileItem.objectKey, fileItem.name )
        return { url, name: fileItem.name }
    } )

export const Route = createFileRoute( "/share/$token" )( { component: ShareAccessPage } )

function ShareAccessPage() {
    const { token } = Route.useParams()
    const [data, setData] = useState<ShareData | null>( null )
    const [error, setError] = useState<string | null>( null )
    const [loading, setLoading] = useState( true )
    const [downloading, setDownloading] = useState( false )

    useEffect( () => {
        void getShareAccessFn( { data: { token } } )
            .then( setData )
            .catch( ( err: Error ) => setError( err.message ) )
            .finally( () => setLoading( false ) )
    }, [token] )

    const handleDownload = async () => {
        setDownloading( true )
        try {
            const { url } = await getShareDownloadUrlFn( { data: { token } } )
            const a = document.createElement( "a" )
            a.href = url
            document.body.appendChild( a )
            a.click()
            document.body.removeChild( a )
        } catch ( err ) {
            toast.error( `Download failed: ${err instanceof Error ? err.message : "Unknown error"}` )
        } finally {
            setDownloading( false )
        }
    }

    if ( loading ) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
        )
    }

    if ( error || !data ) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
                <div className="bg-muted rounded-full p-4">
                    <Link2Off className="text-muted-foreground h-8 w-8" />
                </div>
                <h1 className="text-lg font-semibold">Link unavailable</h1>
                <p className="text-muted-foreground max-w-sm text-sm">
                    {error ?? "This share link is invalid, expired, or has been disabled."}
                </p>
                <Button variant="outline" onClick={() => { window.location.href = "/" }}>
                    Go to home
                </Button>
            </div>
        )
    }

    if ( data.type === "file" ) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4 text-center">
                <div className="bg-muted rounded-full p-4">
                    <FileText className="text-muted-foreground h-10 w-10" />
                </div>
                <div className="space-y-1">
                    <h1 className="text-lg font-semibold">{data.name}</h1>
                    <p className="text-muted-foreground text-sm">
                        {data.mimeType ?? "File"} &middot; {formatBytes( data.sizeInBytes )}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={() => window.open( data.presignedUrl, "_blank" )}>
                        Open file
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => void handleDownload()}
                        disabled={downloading}
                    >
                        {downloading
                            ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            : <Download className="mr-2 h-4 w-4" />}
                        Download
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4 text-center">
            <div className="bg-muted rounded-full p-4">
                <Folder className="text-muted-foreground h-10 w-10" />
            </div>
            <div className="space-y-1">
                <h1 className="text-lg font-semibold">{data.name}</h1>
                <p className="text-muted-foreground text-sm">Shared folder</p>
            </div>
            <Button onClick={() => { window.location.href = `/?nav=${btoa( JSON.stringify( { folderId: data.folderId } ) )}` }}>
                Open folder
            </Button>
        </div>
    )
}

function formatBytes( bytes: number ): string {
    if ( bytes < 1024 ) return `${bytes} B`
    if ( bytes < 1024 * 1024 ) return `${( bytes / 1024 ).toFixed( 1 )} KB`
    if ( bytes < 1024 * 1024 * 1024 ) return `${( bytes / ( 1024 * 1024 ) ).toFixed( 1 )} MB`
    return `${( bytes / ( 1024 * 1024 * 1024 ) ).toFixed( 1 )} GB`
}
