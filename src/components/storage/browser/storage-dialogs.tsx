import { Suspense, useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { lazyWithPreload, preloadWhenIdle } from '@/lib/lazy-with-preload'
import { useCurrentUser } from '@/lib/auth/current-user'
import { useUiStore } from '@/stores/ui-store'
import type { StorageItem } from '@/types/storage'

const FileUploadDialog = lazyWithPreload(() =>
  import('@/components/storage/upload-dialog').then((m) => ({
    default: m.FileUploadDialog,
  })),
)
const FolderUploadDialog = lazyWithPreload(() =>
  import('@/components/storage/folder-upload-dialog').then((m) => ({
    default: m.FolderUploadDialog,
  })),
)
const UrlImportDialog = lazyWithPreload(() =>
  import('@/components/storage/url-import-dialog').then((m) => ({
    default: m.UrlImportDialog,
  })),
)
const NewFolderDialog = lazyWithPreload(() =>
  import('@/components/storage/new-folder-dialog').then((m) => ({
    default: m.NewFolderDialog,
  })),
)
const ShareModal = lazyWithPreload(() =>
  import('@/components/storage/share-modal').then((m) => ({
    default: m.ShareModal,
  })),
)
const MoveModal = lazyWithPreload(() =>
  import('@/components/storage/move-modal').then((m) => ({
    default: m.MoveModal,
  })),
)
const ConfirmDeleteModal = lazyWithPreload(() =>
  import('@/components/storage/confirm-delete-modal').then((m) => ({
    default: m.ConfirmDeleteModal,
  })),
)

type StorageDialogsProps = {
  folderId: string | null
  /** Items the move dialog acts on (the current selection). */
  selectedItems: StorageItem[]
  onCreateFolder: (name: string) => Promise<void>
  onMove: (items: StorageItem[], targetFolderId: string | null) => void
  onTrash: (items: Pick<StorageItem, 'id' | 'type'>[]) => void
}

/**
 * Every dialog of the file browser, driven by `useUiStore`. Each one is only
 * mounted while open, and their code is preloaded when the browser is idle.
 */
export function StorageDialogs({
  folderId,
  selectedItems,
  onCreateFolder,
  onMove,
  onTrash,
}: StorageDialogsProps) {
  const user = useCurrentUser()
  const ui = useUiStore(
    useShallow((state) => ({
      uploadFilesOpen: state.uploadFilesOpen,
      uploadFolderOpen: state.uploadFolderOpen,
      urlImportOpen: state.urlImportOpen,
      newFolderOpen: state.newFolderOpen,
      moveOpen: state.moveOpen,
      moveMode: state.moveMode,
      shareItem: state.shareItem,
      pendingDelete: state.pendingDelete,
    })),
  )
  const actions = useUiStore.getState()

  useEffect(
    () =>
      preloadWhenIdle(
        FileUploadDialog.preload,
        FolderUploadDialog.preload,
        UrlImportDialog.preload,
        NewFolderDialog.preload,
        ShareModal.preload,
        MoveModal.preload,
        ConfirmDeleteModal.preload,
      ),
    [],
  )

  // Dialogs belong to this page; close them when it unmounts.
  useEffect(() => () => useUiStore.getState().reset(), [])

  return (
    <Suspense fallback={null}>
      {ui.uploadFilesOpen && (
        <FileUploadDialog
          open
          onOpenChange={actions.setUploadFilesOpen}
          folderId={folderId}
        />
      )}
      {ui.uploadFolderOpen && (
        <FolderUploadDialog
          open
          onOpenChange={actions.setUploadFolderOpen}
          folderId={folderId}
        />
      )}
      {ui.urlImportOpen && (
        <UrlImportDialog
          open
          onOpenChange={actions.setUrlImportOpen}
          folderId={folderId}
        />
      )}
      {ui.newFolderOpen && (
        <NewFolderDialog
          open
          onOpenChange={actions.setNewFolderOpen}
          onConfirm={onCreateFolder}
        />
      )}
      {ui.shareItem && (
        <ShareModal
          open
          onOpenChange={(open) => !open && actions.closeShare()}
          item={ui.shareItem}
          userId={user.id}
        />
      )}
      {ui.moveOpen && (
        <MoveModal
          open
          onOpenChange={(open) => !open && actions.closeMove()}
          items={selectedItems}
          currentFolderId={folderId}
          onMove={(targetFolderId) => {
            onMove(selectedItems, targetFolderId)
            actions.closeMove()
          }}
          userId={user.id}
          mode={ui.moveMode}
        />
      )}
      {ui.pendingDelete && (
        <ConfirmDeleteModal
          open
          onOpenChange={(open) => !open && actions.closeDelete()}
          isPermanent={false}
          itemCount={ui.pendingDelete.ids.length}
          onConfirm={() => {
            const pending = ui.pendingDelete
            if (pending) {
              onTrash(
                pending.ids.map((id, index) => ({ id, type: pending.types[index] })),
              )
            }
            actions.closeDelete()
          }}
        />
      )}
    </Suspense>
  )
}
