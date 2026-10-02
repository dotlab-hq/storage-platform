import { useCallback, useEffect, useMemo } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { SidebarInset } from '@/components/ui/sidebar'
import { PageHeader } from '@/components/app/page-header'
import { BreadcrumbNav } from '@/components/storage/breadcrumb-nav'
import { TopbarActions } from '@/components/topbar-actions'
import { FileGrid } from '@/components/storage/file-grid'
import { FloatingActionBar } from '@/components/storage/floating-action-bar'
import { DragDropOverlay } from '@/components/storage/drag-drop-overlay'
import { DeviceTransferSection } from '@/components/storage/device-transfer-section'
import { StorageDialogs } from '@/components/storage/browser/storage-dialogs'
import { useCurrentUser } from '@/lib/auth/current-user'
import { folderIdFromNav, useOpenFolder } from '@/hooks/use-folder-navigation'
import { useFolderContents } from '@/hooks/use-folder-contents'
import { useStorageActions } from '@/hooks/use-storage-actions'
import { useBulkActions } from '@/hooks/use-bulk-actions'
import { useDragDrop } from '@/hooks/use-drag-drop'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { useHomeShellActions } from '@/hooks/use-home-shell-actions'
import { useSelectionStore } from '@/stores/selection-store'
import { useUiStore } from '@/stores/ui-store'
import { useUploadStore } from '@/stores/upload-store'
import type { StorageItem } from '@/types/storage'

const routeApi = getRouteApi('/_app/')

/**
 * "My Files": browse a folder, select items, and act on them.
 *
 * Data comes from the folder query (preloaded by the route loader), UI state
 * from the zustand stores, and the open folder from the URL.
 */
export function StoragePage() {
  const search = routeApi.useSearch()
  const navigate = routeApi.useNavigate()
  const folderId = folderIdFromNav(search.nav)
  const user = useCurrentUser()

  const folder = useFolderContents(folderId)
  const openFolder = useOpenFolder()
  const actions = useStorageActions(folderId)
  const bulk = useBulkActions(folderId)
  const dragDrop = useDragDrop(folderId)
  const selectedItems = useSelectedItems(folder.items)
  const selectedIds = useSelectionStore((state) => state.selectedIds)
  const uploads = useFolderUploads(folderId)

  // `?upload=true` (from the dock or a QR flow) opens the upload dialog once.
  useEffect(() => {
    if (!search.upload) return
    useUiStore.getState().setUploadFilesOpen(true)
    void navigate({
      search: (prev) => ({ ...prev, upload: undefined }),
      replace: true,
    })
  }, [search.upload, navigate])

  const orderedIds = useMemo(
    () => folder.items.map((item) => item.id),
    [folder.items],
  )

  const handleItemClick = useCallback(
    (item: StorageItem, event: React.MouseEvent) => {
      const selection = useSelectionStore.getState()
      if (event.metaKey || event.ctrlKey) selection.toggle(item.id)
      else selection.select(item.id, { range: event.shiftKey, orderedIds })
    },
    [orderedIds],
  )

  const confirmTrashSelection = useCallback(() => {
    if (selectedItems.length > 0) {
      useUiStore.getState().confirmDelete(selectedItems)
    }
  }, [selectedItems])

  useKeyboardShortcuts({
    'mod+a': () => useSelectionStore.getState().selectAll(orderedIds),
    escape: () => useSelectionStore.getState().clear(),
    delete: confirmTrashSelection,
  })
  useHomeShellActions()

  const ui = useUiStore.getState()

  return (
    <>
      <SidebarInset {...dragDrop.dropZoneProps}>
        <PageHeader
          title={
            <BreadcrumbNav items={folder.breadcrumbs} onNavigate={openFolder} />
          }
          actions={<TopbarActions isReadOnly={user.readOnly} />}
        />

        <div
          className="flex flex-1 flex-col gap-4 p-2 pt-0 sm:p-4"
          data-shell-context-menu="true"
          onClick={(event) => {
            // Clicking empty space clears the selection.
            const target = event.target as HTMLElement
            if (!target.closest("[data-file-card='true']")) {
              useSelectionStore.getState().clear()
            }
          }}
        >
          <DeviceTransferSection folderId={folderId} />
          <FileGrid
            items={folder.items}
            uploads={uploads}
            isLoading={folder.isLoadingMore}
            selectedIds={selectedIds as Set<string>}
            onItemClick={handleItemClick}
            onBoxSelect={(ids, append) =>
              useSelectionStore.getState().selectMany(ids, append)
            }
            onDoubleClick={actions.open}
            onContextAction={actions.handleContextAction}
            renamingItemId={actions.renamingItemId}
            onRename={actions.rename}
            onRenameCancel={() => actions.setRenamingItemId(null)}
            onDragMoveItem={(itemId, itemType, targetFolderId) =>
              bulk.move([{ id: itemId, type: itemType }], targetFolderId)
            }
            onLoadMore={folder.loadMore}
            hasMore={folder.hasMore}
            isReadOnly={user.readOnly}
            onUploadFiles={() => ui.setUploadFilesOpen(true)}
            onUploadFolder={() => ui.setUploadFolderOpen(true)}
          />
        </div>
      </SidebarInset>

      <DragDropOverlay isDragging={dragDrop.isDragging} />
      <FloatingActionBar
        selectedCount={selectedItems.length}
        onDelete={confirmTrashSelection}
        onMove={() => ui.openMove('move')}
        onShare={() => {
          if (selectedItems.length === 1) ui.openShare(selectedItems[0])
        }}
        onClear={() => useSelectionStore.getState().clear()}
      />
      <StorageDialogs
        folderId={folderId}
        selectedItems={selectedItems}
        onCreateFolder={actions.createFolder}
        onMove={bulk.move}
        onTrash={bulk.moveToTrash}
      />
    </>
  )
}

/** In-progress uploads into this folder, shown as cards in the grid. */
function useFolderUploads(folderId: string | null) {
  const uploads = useUploadStore((state) => state.uploads)
  return useMemo(
    () => uploads.filter((upload) => (upload.targetFolderId ?? null) === folderId),
    [uploads, folderId],
  )
}

/** The selected items, in the order they are listed. */
function useSelectedItems(items: StorageItem[]) {
  const selectedIds = useSelectionStore((state) => state.selectedIds)
  return useMemo(
    () => items.filter((item) => selectedIds.has(item.id)),
    [items, selectedIds],
  )
}
