import { useEffect, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { createClientOnlyFn } from "@tanstack/react-start"
import { Button } from "@/components/ui/button"
import { FileText, Folder, Loader2, Link2Off, Download } from "lucide-react"

type ShareData =
    | { type: "file"; name: string; mimeType: string | null; sizeInBytes: number; presignedUrl: string }
    | { type: "folder"; name: string; folderId: string }

const fetchShareAccess = createClientOnlyFn( async ( token: string ) => {
    const res = await fetch( `/api/storage/share-access?token=${encodeURIComponent( token )}` )
    if ( !res.ok ) {
        const err = ( await res.json() ) as { error?: string }
        throw new Error( err.error ?? `HTTP ${res.status}` )
    }
    return ( await res.json() ) as ShareData
} )

export const Route = createFileRoute( "/share/$token" )( { component: ShareAccessPage } )

function ShareAccessPage() {
    const { token } = Route.useParams()
    const [data, setData] = useState<ShareData | null>( null )
    const [error, setError] = useState<string | null>( null )
    const [loading, setLoading] = useState( true )

    useEffect( () => {
        void fetchShareAccess( token )
            .then( setData )
            .catch( ( err: Error ) => setError( err.message ) )
            .finally( () => setLoading( false ) )
    }, [token] )

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
                    <Button variant="outline" onClick={() => downloadFile( data.presignedUrl, data.name )}>
                        <Download className="mr-2 h-4 w-4" /> Download
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

function downloadFile( url: string, name: string ) {
    const a = document.createElement( "a" )
    a.href = url
    a.download = name
    a.click()
}
