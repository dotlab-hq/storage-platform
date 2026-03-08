import { useCallback, useEffect, useState } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { createClientOnlyFn } from "@tanstack/react-start"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Clock, Folder, FileText } from "lucide-react"
import { SkeletonGrid } from "@/components/storage/skeleton-card"
import { formatRelativeTime } from "@/lib/file-utils"
import { authClient } from "@/lib/auth-client"
import { toast } from "@/components/ui/sonner"
import { encodeNavToken } from "@/lib/nav-token"
import { useQuota } from "@/hooks/use-quota"

type RecentFolder = { id: string; name: string; createdAt: string; parentFolderId: string | null; lastOpenedAt: string }
type RecentFile = { id: string; name: string; sizeInBytes: number; mimeType: string | null; createdAt: string; lastOpenedAt: string }
type RecentItem = { id: string; name: string; lastOpenedAt: Date; kind: "file" | "folder"; mimeType: string | null }

const fetchRecent = createClientOnlyFn( async ( userId: string ) => {
    const res = await fetch( `/api/storage/recent?userId=${encodeURIComponent( userId )}` )
    return ( await res.json() ) as { folders?: RecentFolder[]; files?: RecentFile[] }
} )

const presignOnClient = createClientOnlyFn( async ( userId: string, fileId: string ) => {
    const params = new URLSearchParams( { userId, fileId } )
    const res = await fetch( `/api/storage/presign?${params}` )
    const data = ( await res.json() ) as { url?: string; error?: string }
    if ( !res.ok ) throw new Error( data.error ?? `HTTP ${res.status}` )
    return data.url!
} )

export const Route = createFileRoute( "/recent/" )( { component: RecentPage } )

function RecentPage() {
    const navigate = useNavigate()
    const quota = useQuota()
    const [userId, setUserId] = useState<string | null>( null )
    const [items, setItems] = useState<RecentItem[]>( [] )
    const [isLoading, setIsLoading] = useState( true )

    const load = useCallback( async () => {
        const { data } = await authClient.getSession()
        if ( !data?.user ) return
        setUserId( data.user.id )
        const res = await fetchRecent( data.user.id )
        const mapped: RecentItem[] = [
            ...( res.folders ?? [] ).map( ( f ) => ( {
                id: f.id, name: f.name, lastOpenedAt: new Date( f.lastOpenedAt ), kind: "folder" as const, mimeType: null,
            } ) ),
            ...( res.files ?? [] ).map( ( f ) => ( {
                id: f.id, name: f.name, lastOpenedAt: new Date( f.lastOpenedAt ), kind: "file" as const, mimeType: f.mimeType,
            } ) ),
        ].sort( ( a, b ) => b.lastOpenedAt.getTime() - a.lastOpenedAt.getTime() )
        setItems( mapped )
    }, [] )

    useEffect( () => { void load().finally( () => setIsLoading( false ) ) }, [load] )

    const handleItemClick = useCallback( async ( item: RecentItem ) => {
        if ( item.kind === "folder" ) {
            void navigate( { to: "/", search: { nav: encodeNavToken( { folderId: item.id } ) } } )
            return
        }
        if ( !userId ) return
        try {
            const url = await presignOnClient( userId, item.id )
            window.open( url, "_blank" )
        } catch {
            toast.error( "Failed to open file" )
        }
    }, [navigate, userId] )

    return (
        <div className="min-h-screen">
            <SidebarProvider>
                <AppSidebar quota={quota} />
                <SidebarInset>
                    <header className="flex h-14 shrink-0 items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
                        <div className="flex items-center gap-2">
                            <Clock className="text-muted-foreground h-4 w-4" />
                            <h1 className="text-sm font-semibold">Recent</h1>
                        </div>
                    </header>

                    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                        {isLoading ? (
                            <SkeletonGrid count={8} />
                        ) : items.length === 0 ? (
                            <EmptyState />
                        ) : (
                            <div className="space-y-1">
                                {items.map( ( item ) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => void handleItemClick( item )}
                                        className="hover:bg-accent/50 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors"
                                    >
                                        {item.kind === "folder"
                                            ? <Folder className="text-muted-foreground h-4 w-4 shrink-0" />
                                            : <FileText className="text-muted-foreground h-4 w-4 shrink-0" />}
                                        <span className="min-w-0 flex-1 truncate text-sm">{item.name}</span>
                                        <span className="text-muted-foreground shrink-0 text-xs">
                                            {formatRelativeTime( item.lastOpenedAt )}
                                        </span>
                                    </button>
                                ) )}
                            </div>
                        )}
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </div>
    )
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-muted mb-4 rounded-full p-4">
                <Clock className="text-muted-foreground h-8 w-8" />
            </div>
            <h3 className="text-foreground mb-1 text-sm font-medium">No recent files</h3>
            <p className="text-muted-foreground text-sm">Files you open or edit will show up here</p>
        </div>
    )
}
