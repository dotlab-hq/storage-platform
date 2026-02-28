import {
    Pencil,
    Share2,
    Trash2,
    Download,
    ExternalLink,
    RotateCcw,
    AlertTriangle,
    Link,
} from "lucide-react"
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from "@/components/ui/context-menu"
import type { ContextMenuAction, StorageItem } from "@/types/storage"

type FileContextMenuProps = {
    children: React.ReactNode
    item: StorageItem
    isTrash?: boolean
    onAction: ( action: ContextMenuAction, item: StorageItem ) => void
}

export function FileContextMenu( {
    children,
    item,
    isTrash = false,
    onAction,
}: FileContextMenuProps ) {
    if ( isTrash ) {
        return (
            <ContextMenu>
                <ContextMenuTrigger asChild><div>{children}</div></ContextMenuTrigger>
                <ContextMenuContent className="w-48">
                    <ContextMenuItem onClick={() => onAction( "restore", item )}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Restore
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => onAction( "delete-permanent", item )}
                    >
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Delete permanently
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>
        )
    }

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild><div>{children}</div></ContextMenuTrigger>
            <ContextMenuContent className="w-48">
                <ContextMenuItem onClick={() => onAction( "open", item )}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open
                </ContextMenuItem>
                {item.type === "file" && (
                    <ContextMenuItem onClick={() => onAction( "download", item )}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                    </ContextMenuItem>
                )}
                <ContextMenuSeparator />
                <ContextMenuItem onClick={() => onAction( "rename", item )}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Rename
                </ContextMenuItem>
                {item.type === "file" && (
                    <ContextMenuItem onClick={() => onAction( "share", item )}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                    </ContextMenuItem>
                )}
                <ContextMenuItem onClick={() => onAction( "copy-link", item )}>
                    <Link className="mr-2 h-4 w-4" />
                    Copy Link
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onAction( "delete", item )}
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    )
}
