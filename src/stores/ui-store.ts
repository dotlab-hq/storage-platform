import { create } from 'zustand'
import type { StorageItem } from '@/types/storage'

interface UiState {
  shareItem: StorageItem | null
  moveOpen: boolean
  moveMode: 'move' | 'update-path'
  deleteOpen: boolean
  pendingDelete: { ids: string[]; types: ('file' | 'folder')[] } | null
  uploadFileOpen: boolean
  uploadFolderOpen: boolean
  urlImportOpen: boolean
  newFolderOpen: boolean

  setShareItem: (item: StorageItem | null) => void
  setMoveOpen: (open: boolean) => void
  setMoveMode: (mode: 'move' | 'update-path') => void
  setDeleteOpen: (open: boolean) => void
  setPendingDelete: (
    pending: { ids: string[]; types: ('file' | 'folder')[] } | null,
  ) => void
  setUploadFileOpen: (open: boolean) => void
  setUploadFolderOpen: (open: boolean) => void
  setUrlImportOpen: (open: boolean) => void
  setNewFolderOpen: (open: boolean) => void

  openDeleteForItem: (item: StorageItem) => void
  openMoveWithMode: (mode?: 'move' | 'update-path') => void
}

export const useUiStore = create<UiState>((set) => ({
  shareItem: null,
  moveOpen: false,
  moveMode: 'move',
  deleteOpen: false,
  pendingDelete: null,
  uploadFileOpen: false,
  uploadFolderOpen: false,
  urlImportOpen: false,
  newFolderOpen: false,

  setShareItem: (item) => set({ shareItem: item }),
  setMoveOpen: (open) => set({ moveOpen: open }),
  setMoveMode: (mode) => set({ moveMode: mode }),
  setDeleteOpen: (open) => set({ deleteOpen: open }),
  setPendingDelete: (pending) => set({ pendingDelete: pending }),
  setUploadFileOpen: (open) => set({ uploadFileOpen: open }),
  setUploadFolderOpen: (open) => set({ uploadFolderOpen: open }),
  setUrlImportOpen: (open) => set({ urlImportOpen: open }),
  setNewFolderOpen: (open) => set({ newFolderOpen: open }),

  openDeleteForItem: (item) =>
    set({
      pendingDelete: { ids: [item.id], types: [item.type] },
      deleteOpen: true,
    }),
  openMoveWithMode: (mode = 'move') => set({ moveMode: mode, moveOpen: true }),
}))
