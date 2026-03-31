import { useState } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { FileGrid } from "@/components/storage/file-grid"
import { FloatingActionBar } from "@/components/storage/floating-action-bar"
import { DragDropOverlay } from "@/components/storage/drag-drop-overlay"
import { BreadcrumbNav } from "@/components/storage/breadcrumb-nav"
import { ShareModal } from "@/components/storage/share-modal"
import { MoveModal } from "@/components/storage/move-modal"
import { ConfirmDeleteModal } from "@/components/storage/confirm-delete-modal"
import { CommandPalette } from "@/components/storage/command-palette"
import { TopbarActions } from "@/components/topbar-actions"
import { useStorageData } from "@/hooks/use-storage-data"
import { useFileSelection } from "@/hooks/use-file-selection"
import { useDragDrop } from "@/hooks/use-drag-drop"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { useStorageActions } from "@/hooks/use-storage-actions"
import { useBulkActions } from "@/hooks/use-bulk-actions"
import { useTheme } from "@/hooks/use-theme"
import { useFolderHistory } from "@/hooks/use-folder-history"
import { parseShareToken } from "@/lib/share-navigation"
import { requireAuthBeforeLoad } from "@/lib/auth-route-guards"
import type { StorageItem } from "@/types/storage"

export const Route = createFileRoute( "/" )( {
  beforeLoad: requireAuthBeforeLoad,
  component: StoragePage,
} )
function StoragePage() {
  const navigate = useNavigate()
  const { toggleTheme } = useTheme()
  const storage = useStorageData()
  const selection = useFileSelection( storage.items )
  const dragDrop = useDragDrop( storage.userId, storage.currentFolderId, storage.setUploads, storage.refresh, storage.setItems )

  const [shareItem, setShareItem] = useState<StorageItem | null>( null )
  const [moveOpen, setMoveOpen] = useState( false )
  const [deleteOpen, setDeleteOpen] = useState( false )
  const [pendingDelete, setPendingDelete] = useState<{ ids: string[]; types: ( "file" | "folder" )[] } | null>( null )
  useFolderHistory( storage.currentFolderId, storage.setCurrentFolderId )
  const actions = useStorageActions( {
    userId: storage.userId,
    currentFolderId: storage.currentFolderId,
    setItems: storage.setItems,
    refresh: storage.refresh,
    setCurrentFolderId: storage.setCurrentFolderId,
    select: selection.select,
    clearSelection: selection.clearSelection,
    selectedIds: selection.selectedIds,
    onDeleteOpen: ( item: StorageItem ) => {
      setPendingDelete( { ids: [item.id], types: [item.type] } )
      setDeleteOpen( true )
    },
    onMoveOpen: () => setMoveOpen( true ),
    onShareOpen: ( item ) => setShareItem( item ),
  } )
  const bulk = useBulkActions( {
    userId: storage.userId,
    items: storage.items,
    selectedIds: selection.selectedIds,
    setItems: storage.setItems,
    clearSelection: selection.clearSelection,
    refresh: storage.refresh,
    setDeleteOpen,
    setMoveOpen,
  } )
  useKeyboardShortcuts( {
    "mod+a": () => selection.selectAll(),
    escape: () => selection.clearSelection(),
    delete: () => {
      if ( selection.selectedCount > 0 ) {
        const items = storage.items.filter( ( i ) => selection.selectedIds.has( i.id ) )
        setPendingDelete( { ids: items.map( ( i ) => i.id ), types: items.map( ( i ) => i.type ) } )
        setDeleteOpen( true )
      }
    },
  } )
  const selectedItems = storage.items.filter( ( i ) => selection.selectedIds.has( i.id ) )
  return (
    <div
      className="min-h-screen"
      onDragEnter={dragDrop.handleDragEnter}
      onDragLeave={dragDrop.handleDragLeave}
      onDragOver={dragDrop.handleDragOver}
      onDrop={dragDrop.handleDrop}
    >
      <SidebarProvider>
        <AppSidebar quota={storage.quota} />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center justify-between gap-2 px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <BreadcrumbNav
                items={storage.breadcrumbs}
                onNavigate={( folderId ) =>
                  storage.setCurrentFolderId( folderId )
                }
              />
            </div>
            <TopbarActions
              userId={storage.userId}
              currentFolderId={storage.currentFolderId}
              setUploads={storage.setUploads}
              onUploadComplete={storage.refresh}
              onNewFolder={actions.handleNewFolder}
              onSearch={( results ) => {
                if ( results ) storage.setItems( results )
                else void storage.refresh()
              }}
              setItems={storage.setItems}
              fileSizeLimit={storage.quota?.fileSizeLimit ?? null}
            />
          </header>

          <div
            className="flex flex-1 flex-col gap-4 p-4 pt-0"
            onClick={( event ) => {
              const target = event.target as HTMLElement
              if ( target.closest( "[data-file-card='true']" ) ) return
              selection.clearSelection()
            }}
          >
            <FileGrid
              items={storage.items}
              uploads={storage.uploads}
              isLoading={storage.isLoading}
              selectedIds={selection.selectedIds}
              onSelect={( id, shift ) => selection.select( id, shift )}
              onBoxSelect={( ids, append ) => selection.selectMany( ids, append )}
              onDoubleClick={actions.handleDoubleClick}
              onContextAction={actions.handleContextAction}
              renamingItemId={actions.renamingItemId}
              onRename={actions.handleRename}
              onRenameCancel={() => actions.setRenamingItemId( null )}
              onDragMoveItem={bulk.handleDragMoveItem}
            />
          </div>
        </SidebarInset>
      </SidebarProvider>
      <DragDropOverlay isDragging={dragDrop.isDragging} />
      <FloatingActionBar
        selectedCount={selection.selectedCount}
        onDelete={() => {
          setPendingDelete( { ids: selectedItems.map( ( i ) => i.id ), types: selectedItems.map( ( i ) => i.type ) } )
          setDeleteOpen( true )
        }}
        onShare={() => {
          setShareItem( selectedItems.at( 0 ) ?? null )
        }}
        onClear={selection.clearSelection}
      />
      <ShareModal
        open={!!shareItem}
        onOpenChange={( open ) => !open && setShareItem( null )}
        item={shareItem}
        userId={storage.userId}
      />
      <MoveModal
        open={moveOpen}
        onOpenChange={setMoveOpen}
        items={selectedItems}
        folders={storage.folders}
        currentFolderId={storage.currentFolderId}
        onMove={bulk.handleMove}
        userId={storage.userId}
      />
      <ConfirmDeleteModal
        open={deleteOpen}
        onOpenChange={( open ) => {
          setDeleteOpen( open )
          if ( !open ) setPendingDelete( null )
        }}
        isPermanent={false}
        itemCount={pendingDelete?.ids.length ?? 0}
        onConfirm={() => {
          if ( pendingDelete ) {
            void bulk.handleDelete( pendingDelete.ids, pendingDelete.types )
          }
        }}
      />
      <CommandPalette
        onNavigate={( route ) => void navigate( { to: route } )}
        onToggleTheme={toggleTheme}
        onOpenSharedFolder={() => {
          const raw = window.prompt( "Paste a shared folder token or full share URL" )
          const token = raw ? parseShareToken( raw ) : null
          if ( !token ) return
          void navigate( { to: "/share/$token", params: { token } } )
        }}
      />
    </div>
  )
}
