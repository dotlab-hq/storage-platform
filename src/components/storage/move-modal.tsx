import { useEffect, useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Folder } from "lucide-react"
import { cn } from "@/lib/utils"
import type { StorageItem } from "@/types/storage"

type FolderOption = { id: string; name: string; parentFolderId: string | null }

const UNSELECTED = "__unselected__"

type MoveModalProps = {
    open: boolean
    onOpenChange: ( open: boolean ) => void
    items: StorageItem[]
    folders: { id: string; name: string }[]
    currentFolderId: string | null
    onMove: ( targetFolderId: string | null ) => void
    isLoading?: boolean
    userId?: string | null
}

export function MoveModal( {
    open,
    onOpenChange,
    items,
    currentFolderId,
    onMove,
    isLoading = false,
    userId,
}: MoveModalProps ) {
    const [selectedFolder, setSelectedFolder] = useState<string>( UNSELECTED )
    const [allFolders, setAllFolders] = useState<FolderOption[]>( [] )
    const [fetching, setFetching] = useState( false )
    const movingIds = new Set( items.map( ( i ) => i.id ) )

    // Reset selection every time modal opens
    useEffect( () => {
        if ( open ) {
            setSelectedFolder( UNSELECTED )
        }
    }, [open] )

    useEffect( () => {
        if ( !open || !userId ) return
        setFetching( true )
        void fetch( `/api/storage/all-folders?userId=${encodeURIComponent( userId )}` )
            .then( ( r ) => r.json() as Promise<{ folders?: FolderOption[] }> )
            .then( ( data ) => setAllFolders( data.folders ?? [] ) )
            .finally( () => setFetching( false ) )
    }, [open, userId] )

    const availableFolders = allFolders.filter(
        ( f ) => f.id !== currentFolderId && !movingIds.has( f.id )
    )

    const itemLabel =
        items.length === 1 ? `"${items[0]?.name ?? "item"}"` : `${items.length} items`

    const hasSelection = selectedFolder !== UNSELECTED
    const targetId = selectedFolder === "root" ? null : selectedFolder

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Move {itemLabel}</DialogTitle>
                    <DialogDescription>Select a destination folder.</DialogDescription>
                </DialogHeader>
                <div className="max-h-64 space-y-1 overflow-y-auto rounded-md border p-2">
                    {fetching ? (
                        <p className="text-muted-foreground px-3 py-4 text-center text-sm">Loading folders…</p>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={() => setSelectedFolder( "root" )}
                                className={cn(
                                    "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                                    selectedFolder === "root" ? "bg-primary/10 text-primary" : "hover:bg-muted"
                                )}
                            >
                                <Folder className="h-4 w-4" />
                                My Files (Root)
                            </button>
                            {availableFolders.map( ( folder ) => (
                                <button
                                    key={folder.id}
                                    type="button"
                                    onClick={() => setSelectedFolder( folder.id )}
                                    className={cn(
                                        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                                        selectedFolder === folder.id ? "bg-primary/10 text-primary" : "hover:bg-muted"
                                    )}
                                >
                                    <Folder className="h-4 w-4" />
                                    {folder.name}
                                </button>
                            ) )}
                            {availableFolders.length === 0 && !fetching && (
                                <p className="text-muted-foreground px-3 py-4 text-center text-sm">
                                    No other folders available
                                </p>
                            )}
                        </>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange( false )}>Cancel</Button>
                    <Button
                        onClick={() => onMove( targetId )}
                        disabled={isLoading || fetching || !hasSelection}
                    >
                        {isLoading ? "Moving..." : "Move here"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
