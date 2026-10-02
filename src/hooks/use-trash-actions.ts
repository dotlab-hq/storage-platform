import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/ui/sonner'
import { STORAGE_QUERY_KEYS } from '@/lib/query-keys'
import { removeTrashItems } from '@/lib/storage/trash-query'
import { refreshAllFolders } from '@/lib/storage/folder-query'
import {
  emptyAllTrashFn,
  permanentDeleteTrashItemsFn,
  restoreTrashItemsFn,
} from '@/lib/storage/mutations/trash'
import { useSelectionStore } from '@/stores/selection-store'
import type { TrashItem } from '@/lib/trash-queries'

type ItemRef = Pick<TrashItem, 'id' | 'type'>

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? '' : 's'}`

function toPayload(items: ItemRef[]) {
  return {
    itemIds: items.map((item) => item.id),
    itemTypes: items.map((item) => item.type),
  }
}

/**
 * Restore / delete forever / empty trash. Items vanish from the list at once;
 * on failure the trash is refetched so they come back.
 */
export function useTrashActions() {
  const queryClient = useQueryClient()

  const hide = async (ids: string[]) => {
    await queryClient.cancelQueries({ queryKey: STORAGE_QUERY_KEYS.trash })
    removeTrashItems(queryClient, ids)
    useSelectionStore.getState().clear()
  }

  const refreshTrash = () =>
    queryClient.invalidateQueries({ queryKey: STORAGE_QUERY_KEYS.trash })

  const restore = useMutation({
    mutationFn: (items: ItemRef[]) =>
      restoreTrashItemsFn({ data: toPayload(items) }),
    onMutate: (items) => hide(items.map((item) => item.id)),
    onSuccess: (_result, items) =>
      toast.success(`Restored ${plural(items.length, 'item')}`),
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : 'Restore failed'),
    // Restored items reappear in their original folders.
    onSettled: () => Promise.all([refreshTrash(), refreshAllFolders(queryClient)]),
  })

  const deleteForever = useMutation({
    mutationFn: (items: ItemRef[]) =>
      permanentDeleteTrashItemsFn({ data: toPayload(items) }),
    onMutate: (items) => hide(items.map((item) => item.id)),
    onSuccess: (_result, items) =>
      toast.success(`Permanently deleted ${plural(items.length, 'item')}`),
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : 'Delete failed'),
    onSettled: () =>
      Promise.all([
        refreshTrash(),
        queryClient.invalidateQueries({ queryKey: STORAGE_QUERY_KEYS.quota }),
      ]),
  })

  const emptyTrash = useMutation({
    mutationFn: () => emptyAllTrashFn(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: STORAGE_QUERY_KEYS.trash })
      queryClient.setQueriesData<TrashItem[]>(
        { queryKey: STORAGE_QUERY_KEYS.trash },
        () => [],
      )
    },
    onSuccess: () => toast.success('Trash emptied'),
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : 'Empty trash failed'),
    onSettled: () =>
      Promise.all([
        refreshTrash(),
        queryClient.invalidateQueries({ queryKey: STORAGE_QUERY_KEYS.quota }),
      ]),
  })

  return {
    restore: (items: ItemRef[]) => {
      if (items.length > 0) restore.mutate(items)
    },
    /** Resolves when the server finished (the confirm dialog waits on it). */
    deleteForever: (items: ItemRef[]) =>
      items.length > 0 ? deleteForever.mutateAsync(items).catch(() => {}) : Promise.resolve(),
    emptyTrash: () => emptyTrash.mutateAsync().catch(() => {}),
    isDeleting: deleteForever.isPending || emptyTrash.isPending,
  }
}
