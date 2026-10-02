import { useEffect, useMemo } from 'react'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import {
  flattenFolderPages,
  folderItemsQuery,
} from '@/lib/storage/folder-query'
import { useSelectionStore } from '@/stores/selection-store'

/**
 * Items + breadcrumbs of a folder. The route loader has already put the data
 * in the cache, so this renders immediately; it only suspends if a component
 * asks for a folder nobody prefetched.
 */
export function useFolderContents(folderId: string | null) {
  const query = useSuspenseInfiniteQuery(folderItemsQuery(folderId))
  const { items, breadcrumbs } = useMemo(
    () => flattenFolderPages(query.data),
    [query.data],
  )

  // Keep the selection in sync with what is actually listed.
  useEffect(() => {
    useSelectionStore.getState().retain(items.map((item) => item.id))
  }, [items])

  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query
  return {
    items,
    breadcrumbs,
    hasMore: hasNextPage,
    isLoadingMore: isFetchingNextPage,
    loadMore: () => {
      if (hasNextPage && !isFetchingNextPage) void fetchNextPage()
    },
  }
}
