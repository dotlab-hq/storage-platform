import { useCallback, useEffect, useRef } from "react"
import { FileCard } from "./file-card"
import { FileContextMenu } from "./file-context-menu"
import { UploadingCard } from "./uploading-card"
import { SkeletonGrid } from "./skeleton-card"
import { FileGridEmptyState } from "./file-grid-empty-state"
import { useBoxSelection } from "@/hooks/use-box-selection"
import type { StorageItem, UploadingFile, ContextMenuAction } from "@/types/storage"

function isAppendModifierPressed( event: { metaKey: boolean; ctrlKey: boolean } ) {
    const isMac = typeof navigator !== "undefined" && navigator.platform.toLowerCase().includes( "mac" )
    return isMac ? event.metaKey : event.ctrlKey
}

type BoxSelectCommitContext = {
    completeSelection: ( itemElements: HTMLElement[] ) => string[]
    cancelSelection: () => void
    onBoxSelect?: ( ids: string[], append: boolean ) => void
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
    const didBoxSelectRef = useRef( false )
    const boxSelectCommitContextRef = useRef<BoxSelectCommitContext>( {
        completeSelection: () => [],
        cancelSelection: () => undefined,
        onBoxSelect: undefined,
    } )
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
        beginSelection( event.clientX, event.clientY )
    }, [beginSelection] )

    const handleMouseMove = useCallback( ( event: React.MouseEvent<HTMLDivElement> ) => {
        if ( !isSelecting ) return
        updateSelection( event.clientX, event.clientY )
    }, [isSelecting, updateSelection] )

    const commitBoxSelection = useCallback( ( append: boolean ) => {
        const root = containerRef.current
        if ( !root ) {
            boxSelectCommitContextRef.current.cancelSelection()
            return
        }
        const elements = Array.from(
            root.querySelectorAll<HTMLElement>( "[data-storage-item-id]" )
        )
        const ids = boxSelectCommitContextRef.current.completeSelection( elements )
        boxSelectCommitContextRef.current.onBoxSelect?.( ids, append )
        didBoxSelectRef.current = true
        boxSelectCommitContextRef.current.cancelSelection()
    }, [] )

    useEffect( () => {
        boxSelectCommitContextRef.current = {
            completeSelection,
            cancelSelection,
            onBoxSelect,
        }
    }, [cancelSelection, completeSelection, onBoxSelect] )

    useEffect( () => {
        if ( !isSelecting ) return

        const handleWindowMouseMove = ( event: MouseEvent ) => {
            updateSelection( event.clientX, event.clientY )
        }

        const handleWindowMouseUp = ( event: MouseEvent ) => {
            const append = event.shiftKey || isAppendModifierPressed( event )
            commitBoxSelection( append )
        }

        window.addEventListener( "mousemove", handleWindowMouseMove )
        window.addEventListener( "mouseup", handleWindowMouseUp )

        return () => {
            window.removeEventListener( "mousemove", handleWindowMouseMove )
            window.removeEventListener( "mouseup", handleWindowMouseUp )
        }
    }, [commitBoxSelection, isSelecting, updateSelection] )

    if ( isLoading ) {
        return <SkeletonGrid count={12} />
    }

    const activeUploads = uploads.filter( ( u ) => u.status !== "completed" )
    const hasContent = items.length > 0 || activeUploads.length > 0

    if ( !hasContent ) return <FileGridEmptyState />

    return (
        <div
            ref={containerRef}
            className="relative"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
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
