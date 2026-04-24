import { useState, useEffect, lazy, Suspense, useCallback, useRef } from 'react'
import { Upload } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { PageSkeleton } from '@/components/ui/page-skeleton'
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
import type { StorageItem } from '@/types/storage'
import { HomeMetricsBar } from '@/components/storage/home-metrics-bar'
import { FolderStatsPanel } from '@/components/storage/folder-stats-panel'
import type { HomeLoaderData } from '../-home-server'

const FileGrid = lazy(() =>
  import('@/components/storage/file-grid').then((m) => ({
    default: m.FileGrid,
  })),
)
const FloatingActionBar = lazy(() =>
  import('@/components/storage/floating-action-bar').then((m) => ({
    default: m.FloatingActionBar,
  })),
)
const DragDropOverlay = lazy(() =>
  import('@/components/storage/drag-drop-overlay').then((m) => ({
    default: m.DragDropOverlay,
  })),
)
const FileUploadDialog = lazy(() =>
  import('@/components/storage/upload-dialog').then((m) => ({
    default: m.FileUploadDialog,
  })),
)
const FolderUploadDialog = lazy(() =>
  import('@/components/storage/folder-upload-dialog').then((m) => ({
    default: m.FolderUploadDialog,
  })),
)
const UrlImportDialog = lazy(() =>
  import('@/components/storage/url-import-dialog').then((m) => ({
    default: m.UrlImportDialog,
  })),
)
const ShareModal = lazy(() =>
  import('@/components/storage/share-modal').then((m) => ({
    default: m.ShareModal,
  })),
)
const MoveModal = lazy(() =>
  import('@/components/storage/move-modal').then((m) => ({
    default: m.MoveModal,
  })),
)
const ConfirmDeleteModal = lazy(() =>
  import('@/components/storage/confirm-delete-modal').then((m) => ({
    default: m.ConfirmDeleteModal,
  })),
)
const DeviceTransferSection = lazy(() =>
  import('@/components/storage/device-transfer-section').then((m) => ({
    default: m.DeviceTransferSection,
  })),
)

type StoragePageProps = {
  initial: HomeLoaderData
  search: { upload?: boolean }
}

export function StoragePage({ initial, search }: StoragePageProps) {
  const storage = useStorageData(initial)
  const selection = useFileSelection(storage.items)
  const dragDrop = useDragDrop(
    storage.userId,
    storage.currentFolderId,
    storage.setUploads,
    storage.refresh,
    storage.setItems,
    storage.quota?.fileSizeLimit ?? null,
  )

  const [shareItem, setShareItem] = useState<StorageItem | null>(null)
  const [moveOpen, setMoveOpen] = useState(false)
  const [moveMode, setMoveMode] = useState<'move' | 'update-path'>('move')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<{
    ids: string[]
    types: ('file' | 'folder')[]
  } | null>(null)
  const [uploadFileOpen, setUploadFileOpen] = useState(false)
  const [uploadFolderOpen, setUploadFolderOpen] = useState(false)
  const [urlImportOpen, setUrlImportOpen] = useState(false)

  useEffect(() => {
    if (search.upload) {
      setUploadFileOpen(true)
    }
  }, [search.upload])

  useFolderHistory(storage.currentFolderId, storage.setCurrentFolderId)
  const actions = useStorageActions({
    userId: storage.userId,
    currentFolderId: storage.currentFolderId,
    setItems: storage.setItems,
    refresh: storage.refresh,
    setCurrentFolderId: storage.setCurrentFolderId,
    select: selection.select,
    onDeleteOpen: (item: StorageItem) => {
      setPendingDelete({ ids: [item.id], types: [item.type] })
      setDeleteOpen(true)
    },
    onMoveOpen: (mode = 'move') => {
      setMoveMode(mode)
      setMoveOpen(true)
    },
    onShareOpen: (item) => setShareItem(item),
  })
  const bulk = useBulkActions({
    userId: storage.userId,
    items: storage.items,
    selectedIds: selection.selectedIds,
    setItems: storage.setItems,
    clearSelection: selection.clearSelection,
    refresh: storage.refresh,
    setDeleteOpen,
    setMoveOpen,
  })
  useKeyboardShortcuts({
    'mod+a': () => selection.selectAll(),
    escape: () => selection.clearSelection(),
    delete: () => {
      if (selection.selectedCount > 0) {
        const items = storage.items.filter((i) =>
          selection.selectedIds.has(i.id),
        )
        setPendingDelete({
          ids: items.map((i) => i.id),
          types: items.map((i) => i.type),
        })
        setDeleteOpen(true)
      }
    },
  })
  useHomeShellActions()

  const selectedItems = storage.items.filter((i) =>
    selection.selectedIds.has(i.id),
  )

  return (
    <>
      <SidebarInset
        onDragEnter={dragDrop.handleDragEnter}
        onDragLeave={dragDrop.handleDragLeave}
        onDragOver={dragDrop.handleDragOver}
        onDrop={dragDrop.handleDrop}
      >
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 px-2 sm:px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex min-w-0 items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <div className="min-w-0">
              <BreadcrumbNav
                items={storage.breadcrumbs}
                onNavigate={(folderId) => storage.setCurrentFolderId(folderId)}
              />
            </div>
          </div>
          <div className="max-w-[58vw] sm:max-w-none">
            <TopbarActions
              userId={storage.userId}
              currentFolderId={storage.currentFolderId}
              setUploads={storage.setUploads}
              onUploadComplete={storage.refresh}
              onNewFile={() => {}}
              onNewFolder={actions.handleNewFolder}
              onSearch={(results) => {
                if (results) storage.setItems(results)
                else void storage.refresh()
              }}
              setItems={storage.setItems}
              fileSizeLimit={storage.quota?.fileSizeLimit ?? null}
              isReadOnly={storage.tinySessionPermission === 'read'}
              openUploadFiles={uploadFileOpen}
              onOpenUploadFilesChange={setUploadFileOpen}
              openUploadFolder={uploadFolderOpen}
              onOpenUploadFolderChange={setUploadFolderOpen}
              openUrlImport={urlImportOpen}
              onOpenUrlImportChange={setUrlImportOpen}
            />
          </div>
        </header>

        <div
          className="flex flex-1 flex-col gap-4 p-2 pt-0 sm:p-4"
          data-shell-context-menu="true"
          onClick={(event) => {
            const target = event.target as HTMLElement
            if (target.closest("[data-file-card='true']")) return
            selection.clearSelection()
          }}
        >
          <HomeMetricsBar />
          <FolderStatsPanel folderId={storage.currentFolderId} />
          <Suspense
            fallback={<PageSkeleton className="mb-2" variant="default" />}
          >
            <DeviceTransferSection onSaveRequest={() => {}} />
          </Suspense>
          <Suspense
            fallback={<PageSkeleton className="mb-2" variant="default" />}
          >
            <FileGrid
              items={storage.items}
              uploads={storage.uploads}
              isLoading={storage.isLoading}
              selectedIds={selection.selectedIds}
              onBoxSelect={(ids, append) => selection.selectMany(ids, append)}
              onDoubleClick={actions.handleDoubleClick}
              onContextAction={actions.handleContextAction}
              renamingItemId={actions.renamingItemId}
              onRename={actions.handleRename}
              onRenameCancel={() => actions.setRenamingItemId(null)}
              onDragMoveItem={bulk.handleDragMoveItem}
              onLoadMore={storage.loadMore}
              hasMore={storage.hasMore}
              isReadOnly={storage.tinySessionPermission === 'read'}
              onUploadFiles={() => setUploadFileOpen(true)}
              onUploadFolder={() => setUploadFolderOpen(true)}
            />
          </Suspense>
        </div>
      </SidebarInset>
      <Suspense fallback={null}>
        <DragDropOverlay isDragging={dragDrop.isDragging} />
      </Suspense>
      <Suspense
        fallback={
          <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="bg-card flex items-center gap-2 rounded-xl border px-4 py-2 shadow-lg backdrop-blur-sm">
              <span className="text-foreground mr-2 h-4 w-24 animate-pulse rounded-md bg-muted/50" />
              <div className="bg-border mx-1 h-6 w-px" />
              <div className="h-8 w-16 animate-pulse rounded-md bg-muted/50" />
              <div className="h-8 w-16 animate-pulse rounded-md bg-muted/50" />
            </div>
          </div>
        }
      >
        <FloatingActionBar
          selectedCount={selection.selectedCount}
          onDelete={() => {
            setPendingDelete({
              ids: selectedItems.map((i) => i.id),
              types: selectedItems.map((i) => i.type),
            })
            setDeleteOpen(true)
          }}
          onShare={() => {
            setShareItem(selectedItems.at(0) ?? null)
          }}
          onClear={selection.clearSelection}
        />
      </Suspense>
      <Suspense fallback={<PageSkeleton variant="modal" className="p-4" />}>
        <ShareModal
          open={!!shareItem}
          onOpenChange={(open) => !open && setShareItem(null)}
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
          onOpenChange={(open) => {
            setDeleteOpen(open)
            if (!open) setPendingDelete(null)
          }}
          isPermanent={false}
          itemCount={pendingDelete?.ids.length ?? 0}
          onConfirm={() => {
            if (pendingDelete) {
              void bulk.handleDelete(pendingDelete.ids, pendingDelete.types)
            }
          }}
        />
      </Suspense>
      <Suspense fallback={<PageSkeleton variant="modal" className="p-4" />}>
        <FileUploadDialog
          open={uploadFileOpen}
          onOpenChange={setUploadFileOpen}
          userId={storage.userId}
          currentFolderId={storage.currentFolderId}
          setUploads={storage.setUploads}
          onUploadComplete={storage.refresh}
          setItems={storage.setItems}
          fileSizeLimit={storage.quota?.fileSizeLimit ?? null}
        />
        <FolderUploadDialog
          open={uploadFolderOpen}
          onOpenChange={setUploadFolderOpen}
          userId={storage.userId}
          currentFolderId={storage.currentFolderId}
          setUploads={storage.setUploads}
          onUploadComplete={storage.refresh}
        />
        <UrlImportDialog
          open={urlImportOpen}
          onOpenChange={setUrlImportOpen}
          userId={storage.userId}
          currentFolderId={storage.currentFolderId}
          setItems={storage.setItems}
          onImportComplete={storage.refresh}
        />
      </Suspense>
    </>
  )
}
