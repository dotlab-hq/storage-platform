import { useCallback, useRef } from "react"
import { FileCard } from "./file-card"
import { FileContextMenu } from "./file-context-menu"
import { UploadingCard } from "./uploading-card"
import { SkeletonGrid } from "./skeleton-card"
import { useBoxSelection } from "@/hooks/use-box-selection"
import type { StorageItem, UploadingFile, ContextMenuAction } from "@/types/storage"

function isAppendModifierPressed( event: React.MouseEvent<HTMLDivElement> ) {
    const isMac = typeof navigator !== "undefined" && navigator.platform.toLowerCase().includes( "mac" )
    return isMac ? event.metaKey : event.ctrlKey
}

type FileGridProps = {
    items: StorageItem[]
    uploads: UploadingFile[]
    isLoading: boolean
    isTrash?: boolean
    selectedIds: Set<string>
    onDoubleClick: ( item: StorageItem ) => void
    onContextAction: ( action: ContextMenuAction, item: StorageItem ) => void
    onRetryUpload?: ( id: string ) => void
    renamingItemId?: string | null
    onRename?: ( item: StorageItem, newName: string ) => void
    onRenameCancel?: () => void
    onDragMoveItem?: ( itemId: string, itemType: "file" | "folder", targetFolderId: string ) => void
    onBoxSelect?: ( ids: string[], append: boolean ) => void
}

export function FileGrid( {
    items,
    uploads,
    isLoading,
    isTrash = false,
    selectedIds,
    onDoubleClick,
    onContextAction,
    onRetryUpload,
    renamingItemId,
    onRename,
    onRenameCancel,
    onDragMoveItem,
    onBoxSelect,
}: FileGridProps ) {
    const containerRef = useRef<HTMLDivElement | null>( null )
    const cardAreaYBoundsRef = useRef<{ top: number; bottom: number } | null>( null )
    const didBoxSelectRef = useRef( false )
    const {
        isSelecting,
        selectionRect,
        beginSelection,
        updateSelection,
        completeSelection,
        cancelSelection,
    } = useBoxSelection()

    const handleDropOnFolder = useCallback(
        ( draggedId: string, draggedType: "file" | "folder", targetFolderId: string ) => {
            onDragMoveItem?.( draggedId, draggedType, targetFolderId )
        },
        [onDragMoveItem]
    )

    const handleMouseDown = useCallback( ( event: React.MouseEvent<HTMLDivElement> ) => {
        if ( event.button !== 0 ) return
        const target = event.target as HTMLElement
        if ( target.closest( "[data-file-card='true']" ) ) return
        const root = containerRef.current
        if ( !root ) return
        const cards = Array.from( root.querySelectorAll<HTMLElement>( "[data-storage-item-id]" ) )
        if ( cards.length === 0 ) return
        const bounds = cards.reduce( ( acc, card ) => {
            const rect = card.getBoundingClientRect()
            return { top: Math.min( acc.top, rect.top ), bottom: Math.max( acc.bottom, rect.bottom ) }
        }, { top: Number.POSITIVE_INFINITY, bottom: Number.NEGATIVE_INFINITY } )
        cardAreaYBoundsRef.current = bounds
        beginSelection( event.clientX, bounds.top )
    }, [beginSelection] )

    const handleMouseMove = useCallback( ( event: React.MouseEvent<HTMLDivElement> ) => {
        if ( !isSelecting ) return
        const bounds = cardAreaYBoundsRef.current
        if ( !bounds ) {
            cancelSelection()
            return
        }
        updateSelection( event.clientX, bounds.bottom )
    }, [cancelSelection, isSelecting, updateSelection] )

    const commitBoxSelection = useCallback( ( event: React.MouseEvent<HTMLDivElement> ) => {
        if ( !isSelecting ) return
        const root = containerRef.current
        if ( !root ) {
            cancelSelection()
            return
        }
        const elements = Array.from(
            root.querySelectorAll<HTMLElement>( "[data-storage-item-id]" )
        )
        const ids = completeSelection( elements )
        onBoxSelect?.( ids, event.shiftKey || isAppendModifierPressed( event ) )
        didBoxSelectRef.current = true
        cardAreaYBoundsRef.current = null
        cancelSelection()
    }, [cancelSelection, completeSelection, isSelecting, onBoxSelect] )

    if ( isLoading ) {
        return <SkeletonGrid count={12} />
    }

    const activeUploads = uploads.filter( ( u ) => u.status !== "completed" )
    const hasContent = items.length > 0 || activeUploads.length > 0

    if ( !hasContent ) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-muted mb-4 rounded-full p-4">
                    <svg
                        className="text-muted-foreground h-8 w-8"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                        />
                    </svg>
                </div>
                <h3 className="text-foreground mb-1 text-sm font-medium">
                    No files yet
                </h3>
                <p className="text-muted-foreground text-sm">
                    Upload files or create a folder to get started
                </p>
            </div>
        )
    }

    return (
        <div
            ref={containerRef}
            className="relative"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={commitBoxSelection}
            onMouseLeave={commitBoxSelection}
            onClick={( event ) => {
                if ( didBoxSelectRef.current ) {
                    event.stopPropagation()
                    didBoxSelectRef.current = false
                }
            }}
        >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {activeUploads.map( ( upload ) => (
                    <UploadingCard
                        key={upload.id}
                        upload={upload}
                        onRetry={onRetryUpload}
                    />
                ) )}
                {items.map( ( item ) => (
                    <FileContextMenu
                        key={item.id}
                        item={item}
                        isTrash={isTrash}
                        onAction={onContextAction}
                    >
                        <FileCard
                            item={item}
                            isSelected={selectedIds.has( item.id )}
                            onDoubleClick={onDoubleClick}
                            onContextAction={onContextAction}
                            isRenaming={renamingItemId === item.id}
                            onRename={onRename}
                            onRenameCancel={onRenameCancel}
                            onDropOnFolder={handleDropOnFolder}
                        />
                    </FileContextMenu>
                ) )}
            </div>
            {selectionRect && (
                <div
                    className="pointer-events-none fixed z-30 border border-primary/60 bg-primary/20"
                    style={{
                        left: selectionRect.left,
                        top: selectionRect.top,
                        width: selectionRect.width,
                        height: selectionRect.height,
                    }}
                />
            )}
        </div>
    )
}
