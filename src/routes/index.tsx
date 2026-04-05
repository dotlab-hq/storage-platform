import { useMemo, useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { FilePlus } from 'lucide-react'
import { AppSidebar } from '@/components/app-sidebar'
import { Separator } from '@/components/ui/separator'
} from '@/components/ui/context-menu'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { FileGrid } from '@/components/storage/file-grid'
import { FloatingActionBar } from '@/components/storage/floating-action-bar'
import { DragDropOverlay } from '@/components/storage/drag-drop-overlay'
import { BreadcrumbNav } from '@/components/storage/breadcrumb-nav'
import { ShareModal } from '@/components/storage/share-modal'
import { MoveModal } from '@/components/storage/move-modal'
import { ConfirmDeleteModal } from '@/components/storage/confirm-delete-modal'
import { TextFileEditorDialog } from '@/components/storage/text-file-editor-dialog'
import { SaveFileDialog } from '@/components/storage/save-file-dialog'
import { DeviceTransferSection } from '@/components/storage/device-transfer-section'
import { TopbarActions } from '@/components/topbar-actions'
import { useStorageData } from '@/hooks/use-storage-data'
import { useFileSelection } from '@/hooks/use-file-selection'
import { useDragDrop } from '@/hooks/use-drag-drop'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { useStorageActions } from '@/hooks/use-storage-actions'
import { useBulkActions } from '@/hooks/use-bulk-actions'
import { useFolderHistory } from '@/hooks/use-folder-history'
import { useHomeShellActions } from '@/hooks/use-home-shell-actions'
import { useTinySession } from '@/hooks/use-tiny-session'
import { WebRTCProvider, type IncomingFile } from '@/hooks/use-webrtc'
import type { StorageItem } from '@/types/storage'
import { HomeRoutePending } from './-home-pending'
import { getHomeSnapshotFn } from './-home-server'

export const Route = createFileRoute( '/' )( {
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
  const [editorOpen, setEditorOpen] = useState( false )
  const [editorItem, setEditorItem] = useState<StorageItem | null>( null )
  const [pendingDelete, setPendingDelete] = useState<{
    ids: string[]
    types: ( 'file' | 'folder' )[]
  } | null>( null )
  const [saveFileDialogOpen, setSaveFileDialogOpen] = useState( false )
  const [fileToSave, setFileToSave] = useState<IncomingFile | null>( null )

  const tinySession = useTinySession()
  const [webrtcEnabled, setWebrtcEnabled] = useState( false )

  useEffect( () => {
    const stored = localStorage.getItem( 'dot_webrtc_enabled' )
    setWebrtcEnabled( stored === 'true' )

    const handleToggle = ( e: CustomEvent ) => {
      setWebrtcEnabled( e.detail )
    }
    window.addEventListener( 'webrtc-toggled', handleToggle as EventListener )
    return () =>
      window.removeEventListener(
        'webrtc-toggled',
        handleToggle as EventListener,
      )
  }, [] )

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
    onEditFileOpen: ( item ) => {
      setEditorItem( item )
      setEditorOpen( true )
    },
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

  useEffect( () => {
    const handleCreateNewFile = () => {
      setEditorItem( null )
      setEditorOpen( true )
    }
    window.addEventListener( 'dot:create-new-file', handleCreateNewFile )
    return () => window.removeEventListener( 'dot:create-new-file', handleCreateNewFile )
  }, [] )

  const selectedItems = storage.items.filter( ( i ) =>
    selection.selectedIds.has( i.id ),
  )
  const openCreateFileEditor = useMemo(
    () => () => {
      setEditorItem( null )
      setEditorOpen( true )
    },
    [],
  )

  const handleEditorSaved = ( savedItem: StorageItem ) => {
    storage.setItems( ( prev ) => {
      const index = prev.findIndex( ( item ) => item.id === savedItem.id )
      if ( index === -1 ) {
        return [savedItem, ...prev]
      }

      const next = [...prev]
      next[index] = savedItem
      return next
    } )
  }

  return (
    <WebRTCProvider
      sessionToken={
        webrtcEnabled && tinySession.hasSession ? tinySession.token : null
      }
    >
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
                onNewFile={openCreateFileEditor}
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
              className="flex flex-1 flex-col gap-4 p-4 pt-0 " data-shell-context-menu="true"
              onClick={( event ) => {
                const target = event.target as HTMLElement
                if ( target.closest( "[data-file-card='true']" ) ) return
                selection.clearSelection()
              }}
            >
              <DeviceTransferSection
                onSaveRequest={( file ) => {
                  setFileToSave( file )
                  setSaveFileDialogOpen( true )
                }}
              />
              <FileGrid
                items={storage.items}
                uploads={storage.uploads}
                isLoading={storage.isLoading}
                selectedIds={selection.selectedIds}
                onBoxSelect={( ids, append ) =>
                  selection.selectMany( ids, append )
                }
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
        <TextFileEditorDialog
          open={editorOpen}
          onOpenChange={setEditorOpen}
          currentFolderId={storage.currentFolderId}
          item={editorItem}
          items={storage.items}
          userId={storage.userId}
          onSaved={handleEditorSaved}
        />
        <SaveFileDialog
          open={saveFileDialogOpen}
          onOpenChange={setSaveFileDialogOpen}
          file={fileToSave}
          currentFolderId={storage.currentFolderId}
          userId={storage.userId}
          onSave={( folderId ) => {
            if ( fileToSave ) {
              console.log( 'Saving file to folder:', folderId )
            }
          }}
        />
      </div>
    </WebRTCProvider>
  )
}
