import type { StorageItem } from '@/types/storage'

export type UseStorageActionsParams = {
  userId: string | null
  currentFolderId: string | null
  setItems: React.Dispatch<React.SetStateAction<StorageItem[]>>
  refresh: () => Promise<void>
  setCurrentFolderId: (id: string | null) => void
  select: (id: string, shift: boolean) => void
  onDeleteOpen: (item: StorageItem) => void
  onMoveOpen: (mode?: 'move' | 'update-path') => void
  onShareOpen: (item: StorageItem) => void
}
