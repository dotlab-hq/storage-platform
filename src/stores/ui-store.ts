import { create } from 'zustand'
import type { StorageItem } from '@/types/storage'

export type MoveMode = 'move' | 'update-path'
export type PendingDelete = { ids: string[]; types: StorageItem['type'][] }

/**
 * Open/closed state of the file-browser dialogs.
 *
 * Kept global so the topbar, dock, command palette, context menus and the
 * page itself all open the *same* dialog instance.
 */
type DialogState = {
  uploadFilesOpen: boolean
  uploadFolderOpen: boolean
  urlImportOpen: boolean
  newFolderOpen: boolean
  moveOpen: boolean
  moveMode: MoveMode
  shareItem: StorageItem | null
  pendingDelete: PendingDelete | null
}

type DialogActions = {
  setUploadFilesOpen: (open: boolean) => void
  setUploadFolderOpen: (open: boolean) => void
  setUrlImportOpen: (open: boolean) => void
  setNewFolderOpen: (open: boolean) => void
  openMove: (mode?: MoveMode) => void
  closeMove: () => void
  openShare: (item: StorageItem) => void
  closeShare: () => void
  /** Opens the delete confirmation for the given items. */
  confirmDelete: (items: Pick<StorageItem, 'id' | 'type'>[]) => void
  closeDelete: () => void
  /** Closes everything; called when leaving the page. */
  reset: () => void
}

const initialState: DialogState = {
  uploadFilesOpen: false,
  uploadFolderOpen: false,
  urlImportOpen: false,
  newFolderOpen: false,
  moveOpen: false,
  moveMode: 'move',
  shareItem: null,
  pendingDelete: null,
}

export const useUiStore = create<DialogState & DialogActions>((set) => ({
  ...initialState,

  setUploadFilesOpen: (open) => set({ uploadFilesOpen: open }),
  setUploadFolderOpen: (open) => set({ uploadFolderOpen: open }),
  setUrlImportOpen: (open) => set({ urlImportOpen: open }),
  setNewFolderOpen: (open) => set({ newFolderOpen: open }),
  openMove: (mode = 'move') => set({ moveOpen: true, moveMode: mode }),
  closeMove: () => set({ moveOpen: false }),
  openShare: (item) => set({ shareItem: item }),
  closeShare: () => set({ shareItem: null }),
  confirmDelete: (items) =>
    set({
      pendingDelete: {
        ids: items.map((item) => item.id),
        types: items.map((item) => item.type),
      },
    }),
  closeDelete: () => set({ pendingDelete: null }),
  reset: () => set(initialState),
}))
