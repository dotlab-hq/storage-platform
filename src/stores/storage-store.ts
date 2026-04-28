import { create } from 'zustand'
import type {
  StorageItem,
  StorageFolder,
  UserQuota,
  BreadcrumbItem,
} from '@/types/storage'

interface StorageState {
  userId: string | null
  currentFolderId: string | null
  items: StorageItem[]
  folders: StorageFolder[]
  breadcrumbs: BreadcrumbItem[]
  quota: UserQuota | null
  tinySessionPermission: 'read' | 'read-write' | undefined
  isNavigating: boolean

  setUserId: (id: string | null) => void
  setCurrentFolderId: (id: string | null) => void
  setItems: (items: StorageItem[]) => void
  appendItems: (items: StorageItem[]) => void
  updateItem: (id: string, updates: Partial<StorageItem>) => void
  removeItems: (ids: string[]) => void
  prependItem: (item: StorageItem) => void
  setFolders: (folders: StorageFolder[]) => void
  appendFolders: (folders: StorageFolder[]) => void
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void
  setQuota: (quota: UserQuota | null) => void
  setTinySessionPermission: (p: 'read' | 'read-write' | undefined) => void
  setIsNavigating: (v: boolean) => void
}

export const useStorageStore = create<StorageState>((set) => ({
  userId: null,
  currentFolderId: null,
  items: [],
  folders: [],
  breadcrumbs: [],
  quota: null,
  tinySessionPermission: undefined,
  isNavigating: false,

  setUserId: (id) => set({ userId: id }),
  setCurrentFolderId: (id) => set({ currentFolderId: id }),
  setItems: (items) => set({ items }),
  appendItems: (newItems) =>
    set((state) => {
      const existingIds = new Set(state.items.map((i) => i.id))
      const unique = newItems.filter((i) => !existingIds.has(i.id))
      return { items: [...state.items, ...unique] }
    }),
  updateItem: (id, updates) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item,
      ) as StorageItem[],
    })),
  removeItems: (ids) =>
    set((state) => {
      const idSet = new Set(ids)
      return { items: state.items.filter((i) => !idSet.has(i.id)) }
    }),
  prependItem: (item) => set((state) => ({ items: [item, ...state.items] })),
  setFolders: (folders) => set({ folders }),
  appendFolders: (newFolders) =>
    set((state) => {
      const existingIds = new Set(state.folders.map((f) => f.id))
      const unique = newFolders.filter((f) => !existingIds.has(f.id))
      return { folders: [...state.folders, ...unique] }
    }),
  setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
  setQuota: (quota) => set({ quota }),
  setTinySessionPermission: (p) => set({ tinySessionPermission: p }),
  setIsNavigating: (v) => set({ isNavigating: v }),
}))
