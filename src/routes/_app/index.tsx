import { useMemo, useState, useEffect, lazy, Suspense } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { FileGrid } from '@/components/storage/file-grid'
import { FloatingActionBar } from '@/components/storage/floating-action-bar'
import { DragDropOverlay } from '@/components/storage/drag-drop-overlay'
import { BreadcrumbNav } from '@/components/storage/breadcrumb-nav'
import { TopbarActions } from '@/components/topbar-actions'
import { useStorageData } from '@/hooks/use-storage-data'
import { useFileSelection } from '@/hooks/use-file-selection'
import { useDragDrop } from '@/hooks/use-drag-drop'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { useStorageActions } from '@/hooks/use-storage-actions'
import { useBulkActions } from '@/hooks/use-bulk-actions'
import { useFolderHistory } from '@/hooks/use-folder-history'
import { useHomeShellActions } from '@/hooks/use-home-shell-actions'
import type { IncomingFile } from '@/hooks/use-webrtc'
import type { StorageItem } from '@/types/storage'
import { isAuthenticatedMiddleware } from '@/middlewares/isAuthenticated'
import { HomeRoutePending } from '../-home-pending'
import { getHomeSnapshotFn } from '../-home-server'

const ShareModal = lazy( () =>
  import( '@/components/storage/share-modal' ).then( ( m ) => ( {
    default: m.ShareModal,
  } ) ),
)
const MoveModal = lazy( () =>
  import( '@/components/storage/move-modal' ).then( ( m ) => ( {
    default: m.MoveModal,
  } ) ),
)
const ConfirmDeleteModal = lazy( () =>
  import( '@/components/storage/confirm-delete-modal' ).then( ( m ) => ( {
    default: m.ConfirmDeleteModal,
  } ) ),
)

const DeviceTransferSection = lazy( () =>
  import( '@/components/storage/device-transfer-section' ).then( ( m ) => ( {
    default: m.DeviceTransferSection,
  } ) ),
)

export const Route = createFileRoute( '/_app/' )( {
  server: {
    middleware: [isAuthenticatedMiddleware],
  },
  component: StoragePage,

  loader: () => getHomeSnapshotFn(),
  pendingComponent: HomeRoutePending,
} )
function StoragePage() {
  const initial = Route.useLoaderData()
  const storage = useStorageData( initial )
  const selection = useFileSelection( storage.items )
  const dragDrop = useDragDrop(
    storage.userId,
    storage.currentFolderId,
    storage.setUploads,
    storage.refresh,
    storage.setItems,
    storage.quota?.fileSizeLimit ?? null,
  )

  const [shareItem, setShareItem] = useState<StorageItem | null>( null )
  const [moveOpen, setMoveOpen] = useState( false )
  const [moveMode, setMoveMode] = useState<'move' | 'update-path'>( 'move' )
  const [deleteOpen, setDeleteOpen] = useState( false )
  const [pendingDelete, setPendingDelete] = useState<{
    ids: string[]
    types: ( 'file' | 'folder' )[]
  } | null>( null )

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
    onMoveOpen: ( mode = 'move' ) => {
      setMoveMode( mode )
      setMoveOpen( true )
    },
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
    'mod+a': () => selection.selectAll(),
    escape: () => selection.clearSelection(),
    delete: () => {
      if ( selection.selectedCount > 0 ) {
        const items = storage.items.filter( ( i ) =>
          selection.selectedIds.has( i.id ),
        )
        setPendingDelete( {
          ids: items.map( ( i ) => i.id ),
          types: items.map( ( i ) => i.type ),
        } )
        setDeleteOpen( true )
      }
    },
  } )
  useHomeShellActions()

  const selectedItems = storage.items.filter( ( i ) =>
    selection.selectedIds.has( i.id ),
  )

  return (
    <>
      <SidebarInset
        onDragEnter={dragDrop.handleDragEnter}
        onDragLeave={dragDrop.handleDragLeave}
        onDragOver={dragDrop.handleDragOver}
        onDrop={dragDrop.handleDrop}
      >
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <BreadcrumbNav
              items={storage.breadcrumbs}
              onNavigate={( folderId ) => storage.setCurrentFolderId( folderId )}
            />
          </div>
          <TopbarActions
            userId={storage.userId}
            currentFolderId={storage.currentFolderId}
            setUploads={storage.setUploads}
            onUploadComplete={storage.refresh}
            onNewFile={() => { }}
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
          className="flex flex-1 flex-col gap-4 p-4 pt-0 "
          data-shell-context-menu="true"
          onClick={( event ) => {
            const target = event.target as HTMLElement
            if ( target.closest( "[data-file-card='true']" ) ) return
            selection.clearSelection()
          }}
        >
          <Suspense fallback={null}>
            <DeviceTransferSection onSaveRequest={() => { }} />
          </Suspense>
          <FileGrid
            items={storage.items}
            uploads={storage.uploads}
            isLoading={storage.isLoading}
            selectedIds={selection.selectedIds}
            onBoxSelect={( ids, append ) => selection.selectMany( ids, append )}
            onDoubleClick={actions.handleDoubleClick}
            onContextAction={actions.handleContextAction}
            renamingItemId={actions.renamingItemId}
            onRename={actions.handleRename}
            onRenameCancel={() => actions.setRenamingItemId( null )}
            onDragMoveItem={bulk.handleDragMoveItem}
            onLoadMore={storage.loadMore}
            hasMore={storage.hasMore}
          />
        </div>
      </SidebarInset>
      <DragDropOverlay isDragging={dragDrop.isDragging} />
      <FloatingActionBar
        selectedCount={selection.selectedCount}
        onDelete={() => {
          setPendingDelete( {
            ids: selectedItems.map( ( i ) => i.id ),
            types: selectedItems.map( ( i ) => i.type ),
          } )
          setDeleteOpen( true )
        }}
        onShare={() => {
          setShareItem( selectedItems.at( 0 ) ?? null )
        }}
        onClear={selection.clearSelection}
      />
      <Suspense fallback={null}>
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
          currentFolderId={storage.currentFolderId}
          onMove={bulk.handleMove}
          userId={storage.userId}
          mode={moveMode}
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

      </Suspense>
    </>
  )
}
