import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SortField = 'name' | 'createdAt' | 'updatedAt' | 'size'
export type SortOrder = 'asc' | 'desc'

interface SortState {
  field: SortField
  order: SortOrder
  setField: (field: SortField) => void
  toggleOrder: () => void
}

export const useSortStore = create<SortState>()(
  persist(
    (set) => ({
      field: 'name',
      order: 'asc',
      setField: (field) => set({ field }),
      toggleOrder: () =>
        set((state) => ({ order: state.order === 'asc' ? 'desc' : 'asc' })),
    }),
    {
      name: 'sort-storage',
    },
  ),
)
