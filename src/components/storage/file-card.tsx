import { useCallback } from "react"
import {
    MoreHorizontal, Pencil, Share2,
    Trash2, Download, ExternalLink, Link,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
    getFileIcon, getFolderIcon, formatFileSize, formatRelativeTime,
} from "@/lib/file-utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { InlineRename } from "./inline-rename"
import type { StorageItem, ContextMenuAction } from "@/types/storage"

type FileCardProps = {
    item: StorageItem
    isSelected: boolean
    onSelect: ( id: string, shiftKey: boolean ) => void
    onDoubleClick: ( item: StorageItem ) => void
    onContextAction?: ( action: ContextMenuAction, item: StorageItem ) => void
    isRenaming?: boolean
    onRename?: ( item: StorageItem, newName: string ) => void
    onRenameCancel?: () => void
    onDropOnFolder?: ( draggedId: string, draggedType: "file" | "folder", targetFolderId: string ) => void
}

export function FileCard( {
    item, isSelected, onSelect, onDoubleClick,
    onContextAction, isRenaming = false, onRename, onRenameCancel, onDropOnFolder,
}: FileCardProps ) {
    const isFolder = item.type === "folder"
    const Icon = isFolder
        ? getFolderIcon()
        : getFileIcon( item.type === "file" ? item.mimeType : null )

    const handleDragStart = useCallback( ( e: React.DragEvent ) => {
        e.dataTransfer.setData( "application/storage-item-id", item.id )
        e.dataTransfer.setData( "application/storage-item-type", item.type )
        e.dataTransfer.effectAllowed = "move"
    }, [item.id, item.type] )

    const handleDragOver = useCallback( ( e: React.DragEvent ) => {
        if ( !isFolder ) return
        if ( e.dataTransfer.types.includes( "application/storage-item-id" ) ) {
            e.preventDefault()
            e.dataTransfer.dropEffect = "move"
        }
    }, [isFolder] )

    const handleDrop = useCallback( ( e: React.DragEvent ) => {
        if ( !isFolder ) return
        e.preventDefault()
        e.stopPropagation()
        const draggedId = e.dataTransfer.getData( "application/storage-item-id" )
        const draggedType = e.dataTransfer.getData( "application/storage-item-type" ) as "file" | "folder"
        if ( draggedId && draggedId !== item.id ) {
            onDropOnFolder?.( draggedId, draggedType, item.id )
        }
    }, [isFolder, item.id, onDropOnFolder] )

    return (
        <div
            className={cn(
                "file-card group relative cursor-pointer rounded-xl border p-4 transition-all duration-200",
                "hover:shadow-md hover:-translate-y-0.5 hover:bg-accent/50",
                isSelected && "ring-primary/50 border-primary/30 bg-primary/5 ring-2",
                !isSelected && "bg-card"
            )}
            draggable={!isRenaming}
            onClick={( e ) => onSelect( item.id, e.shiftKey )}
            onDoubleClick={() => onDoubleClick( item )}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            {onContextAction && (
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-7 w-7"
                                onClick={( e ) => e.stopPropagation()}>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem onClick={() => onContextAction( "open", item )}>
                                <ExternalLink className="mr-2 h-4 w-4" /> Open
                            </DropdownMenuItem>
                            {item.type === "file" && (
                                <DropdownMenuItem onClick={() => onContextAction( "download", item )}>
                                    <Download className="mr-2 h-4 w-4" /> Download
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onContextAction( "rename", item )}>
                                <Pencil className="mr-2 h-4 w-4" /> Rename
                            </DropdownMenuItem>
                            {item.type === "file" && (
                                <DropdownMenuItem onClick={() => onContextAction( "share", item )}>
                                    <Share2 className="mr-2 h-4 w-4" /> Share
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => onContextAction( "copy-link", item )}>
                                <Link className="mr-2 h-4 w-4" /> Copy Link
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive"
                                onClick={() => onContextAction( "delete", item )}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}

            <div className={cn(
                "mb-3 flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                isFolder ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}>
                <Icon className="h-5 w-5" />
            </div>

            <div className="mb-1 truncate text-sm font-medium" title={item.name}>
                <InlineRename
                    name={item.name}
                    isRenaming={isRenaming}
                    onRename={( newName ) => onRename?.( item, newName )}
                    onCancel={() => onRenameCancel?.()}
                />
            </div>

            <div className="text-muted-foreground flex items-center gap-2 text-xs">
                {item.type === "file" && <span>{formatFileSize( item.sizeInBytes )}</span>}
                <span>{formatRelativeTime( item.createdAt )}</span>
            </div>

            {item.type === "file" && item.isShared && (
                <Badge variant="secondary" className="mt-2 text-[10px]">Shared</Badge>
            )}
        </div>
    )
}
