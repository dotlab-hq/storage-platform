import { queryOptions } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { listTrashFolderContentsFn } from '@/lib/storage/mutations/trash'
import { STORAGE_QUERY_KEYS } from '@/lib/query-keys'
import type { TrashItem } from '@/lib/trash-queries'

/** Trashed items directly inside `parentFolderId` (null = trash root). */
export function trashFolderQuery(parentFolderId: string | null) {
  return queryOptions({
    queryKey: STORAGE_QUERY_KEYS.trashFolder(parentFolderId),
    queryFn: async (): Promise<TrashItem[]> => {
      const { items } = await listTrashFolderContentsFn({
        data: { parentFolderId },
      })
      return items
    },
  })
}

/** Optimistically hides items in every cached trash listing. */
export function removeTrashItems(queryClient: QueryClient, ids: string[]) {
  const idSet = new Set(ids)
  queryClient.setQueriesData<TrashItem[]>(
    { queryKey: STORAGE_QUERY_KEYS.trash },
    (items) => items?.filter((item) => !idSet.has(item.id)),
  )
}
