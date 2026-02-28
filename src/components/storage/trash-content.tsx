import { Trash2, RotateCcw, AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getFileIcon, getFolderIcon, formatFileSize } from "@/lib/file-utils"

type TrashItemData = {
    id: string
    name: string
    type: "file" | "folder"
    deletedAt: string | null
    sizeInBytes?: number
    mimeType?: string | null
}

type TrashContentProps = {
    items: TrashItemData[]
    isLoading: boolean
    onRestore: ( id: string, type: "file" | "folder" ) => void
    onDelete: ( id: string, type: "file" | "folder" ) => void
}

export function TrashContent( { items, isLoading, onRestore, onDelete }: TrashContentProps ) {
    if ( isLoading ) {
        return (
            <div className="flex flex-1 items-center justify-center py-20">
                <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
        )
    }

    if ( items.length === 0 ) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
                <div className="bg-muted mb-4 rounded-full p-4">
                    <Trash2 className="text-muted-foreground h-8 w-8" />
                </div>
                <h3 className="text-foreground mb-1 text-sm font-medium">
                    Trash is empty
                </h3>
                <p className="text-muted-foreground text-sm">
                    Items you delete will appear here
                </p>
            </div>
        )
    }

    return (
        <div className="flex flex-1 flex-col gap-2 p-4 pt-0">
            <p className="text-muted-foreground mb-2 text-xs">
                {items.length} item{items.length !== 1 ? "s" : ""} in trash
            </p>
            {items.map( ( item ) => (
                <TrashRow
                    key={item.id}
                    item={item}
                    onRestore={() => onRestore( item.id, item.type )}
                    onDelete={() => onDelete( item.id, item.type )}
                />
            ) )}
        </div>
    )
}

function TrashRow( { item, onRestore, onDelete }: {
    item: TrashItemData
    onRestore: () => void
    onDelete: () => void
} ) {
    const Icon = item.type === "folder"
        ? getFolderIcon()
        : getFileIcon( item.mimeType ?? null )

    const deletedLabel = item.deletedAt ? formatTimeSince( item.deletedAt ) : "Unknown"

    return (
        <div className="bg-card flex items-center justify-between rounded-lg border p-3 opacity-75 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-muted-foreground text-xs">
                        Deleted {deletedLabel}
                        {item.type === "file" && item.sizeInBytes != null && (
                            <> &middot; {formatFileSize( item.sizeInBytes )}</>
                        )}
                    </p>
                </div>
            </div>
            <div className="flex gap-1 shrink-0 ml-2">
                <Button size="sm" variant="ghost" onClick={onRestore}>
                    <RotateCcw className="mr-1 h-3 w-3" />
                    Restore
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={onDelete}
                >
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    Delete
                </Button>
            </div>
        </div>
    )
}

function formatTimeSince( isoDate: string ): string {
    const ms = Date.now() - new Date( isoDate ).getTime()
    const minutes = Math.floor( ms / 60000 )
    if ( minutes < 1 ) return "just now"
    if ( minutes < 60 ) return `${minutes}m ago`
    const hours = Math.floor( minutes / 60 )
    if ( hours < 24 ) return `${hours}h ago`
    const days = Math.floor( hours / 24 )
    if ( days < 30 ) return `${days}d ago`
    return `${Math.floor( days / 30 )}mo ago`
}
