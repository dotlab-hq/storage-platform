import { useEffect, useMemo, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { ArrowLeft, File, Loader2 } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { useQuota } from "@/hooks/use-quota"
import { formatBytes } from "@/lib/format-bytes"

type BucketFileItem = {
    id: string
    name: string
    sizeInBytes: number
    mimeType: string | null
    createdAt: string
    objectKey: string
}

type BucketItemsResponse = {
    files?: BucketFileItem[]
    error?: string
}

export const Route = createFileRoute( "/buckets/$bucketName" as never )( {
    component: BucketFilesPage,
} )

function BucketFilesPage() {
    const quota = useQuota()
    const { bucketName } = Route.useParams()
    const [files, setFiles] = useState<BucketFileItem[]>( [] )
    const [isLoading, setIsLoading] = useState<boolean>( true )
    const [error, setError] = useState<string | null>( null )

    useEffect( () => {
        const fetchItems = async () => {
            setIsLoading( true )
            setError( null )
            try {
                const params = new URLSearchParams( { bucketName } )
                const response = await fetch( `/api/storage/s3/bucket-items?${params.toString()}` )
                const payload = ( await response.json() ) as BucketItemsResponse
                if ( !response.ok ) {
                    throw new Error( payload.error ?? "Failed to load bucket files" )
                }
                setFiles( payload.files ?? [] )
            } catch ( fetchError ) {
                setError( fetchError instanceof Error ? fetchError.message : "Failed to load bucket files" )
            } finally {
                setIsLoading( false )
            }
        }

        void fetchItems()
    }, [bucketName] )

    const decodedName = useMemo( () => decodeURIComponent( bucketName ), [bucketName] )

    return (
        <div className="min-h-screen">
            <SidebarProvider>
                <AppSidebar quota={quota} />
                <SidebarInset>
                    <header className="flex h-14 shrink-0 items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
                        <h1 className="text-sm font-semibold">Bucket Files</h1>
                    </header>
                    <div className="space-y-4 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-muted-foreground text-xs">Virtual Bucket</p>
                                <h2 className="text-lg font-semibold">{decodedName}</h2>
                            </div>
                            <Button variant="outline" onClick={() => { window.location.href = "/buckets" }}>
                                <ArrowLeft className="h-4 w-4" />
                                Back to Buckets
                            </Button>
                        </div>

                        {error && (
                            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
                        )}

                        {isLoading && (
                            <div className="text-muted-foreground flex items-center gap-2 py-6 text-sm">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading bucket files...
                            </div>
                        )}

                        {!isLoading && files.length === 0 && (
                            <div className="text-muted-foreground rounded-lg border border-dashed p-5 text-sm">No files tracked in this virtual bucket.</div>
                        )}

                        {!isLoading && files.length > 0 && (
                            <div className="space-y-2">
                                {files.map( ( item ) => (
                                    <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <File className="h-4 w-4" />
                                                <p className="truncate text-sm font-medium">{item.name}</p>
                                            </div>
                                            <p className="text-muted-foreground truncate text-xs">{item.objectKey}</p>
                                        </div>
                                        <div className="text-muted-foreground text-xs">{formatBytes( item.sizeInBytes )}</div>
                                    </div>
                                ) )}
                            </div>
                        )}
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </div>
    )
}
