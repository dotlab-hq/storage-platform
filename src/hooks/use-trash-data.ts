import { useCallback, useEffect, useState } from 'react'
import { createClientOnlyFn } from '@tanstack/react-start'
import { authClient } from '@/lib/auth-client'
import { toast } from '@/components/ui/sonner'
import type { TrashItem } from '@/lib/trash-queries'
import {
  listTrashItemsFn,
  restoreTrashItemsFn,
  permanentDeleteTrashItemsFn,
} from '@/lib/storage/mutations/trash'

const checkAuthClient = createClientOnlyFn(async () => {
  const { data, error } = await authClient.getSession()
  if (error || !data?.user) {
    window.location.href = '/auth'
    return null
  }
  return data.user.id
})

const fetchTrashItems = createClientOnlyFn(async () => {
  const data = await listTrashItemsFn()
  return data.items ?? []
})

const restoreOnClient = createClientOnlyFn(
  async (ids: string[], types: ('file' | 'folder')[]) => {
    await restoreTrashItemsFn({ data: { itemIds: ids, itemTypes: types } })
  },
)

const permanentDeleteOnClient = createClientOnlyFn(
  async (ids: string[], types: ('file' | 'folder')[]) => {
    await permanentDeleteTrashItemsFn({
      data: { itemIds: ids, itemTypes: types },
    })
  },
)

export function useTrashData() {
  const [userId, setUserId] = useState<string | null>(null)
  const [items, setItems] = useState<TrashItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadItems = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await fetchTrashItems()
      setItems(data)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void checkAuthClient().then(async (uid) => {
      if (!uid) return
      setUserId(uid)
      await loadItems()
    })
  }, [])

  const refresh = useCallback(async () => {
    if (userId) await loadItems()
  }, [userId, loadItems])

  const handleRestore = useCallback(
    async (itemIds: string[], itemTypes: ('file' | 'folder')[]) => {
      if (!userId) return
      // Optimistic update
      setItems((prev) => prev.filter((i) => !itemIds.includes(i.id)))
      try {
        await restoreOnClient(itemIds, itemTypes)
        toast.success(
          itemIds.length === 1
            ? 'Item restored'
            : `${itemIds.length} items restored`,
        )
      } catch (err) {
        void refresh()
        toast.error(err instanceof Error ? err.message : 'Restore failed')
      }
    },
    [userId, refresh],
  )

  const handlePermanentDelete = useCallback(
    async (itemIds: string[], itemTypes: ('file' | 'folder')[]) => {
      if (!userId) return
      // Optimistic update
      setItems((prev) => prev.filter((i) => !itemIds.includes(i.id)))
      try {
        await permanentDeleteOnClient(itemIds, itemTypes)
        toast.success(
          itemIds.length === 1
            ? 'Permanently deleted'
            : `${itemIds.length} items deleted`,
        )
      } catch (err) {
        void refresh()
        toast.error(err instanceof Error ? err.message : 'Delete failed')
      }
    },
    [userId, refresh],
  )

  return {
    userId,
    items,
    isLoading,
    refresh,
    handleRestore,
    handlePermanentDelete,
  }
}
