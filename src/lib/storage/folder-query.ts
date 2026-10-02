import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query'
import type { InfiniteData, QueryClient } from '@tanstack/react-query'
import { getFolderItemsFn } from '@/lib/storage/queries/server'
import { getUserQuotaSnapshotFn } from '@/lib/server-functions/quota'
import { STORAGE_QUERY_KEYS } from '@/lib/query-keys'
import type { BreadcrumbItem, StorageItem } from '@/types/storage'

/**
 * Query definitions for the "My Files" browser.
 *
 * Route loaders call `ensureInfiniteQueryData(folderItemsQuery(id))` so the
 * page renders with data already in the cache; components read the very same
 * options with `useSuspenseInfiniteQuery`. Mutations update the cache through
 * the helpers at the bottom of this file, so there is exactly one copy of the
 * folder contents in the app.
 */

export const FOLDER_PAGE_SIZE = 100

export type FolderPage = {
  items: StorageItem[]
  breadcrumbs: BreadcrumbItem[]
  page: number
}

type RawFolderItems = Awaited<ReturnType<typeof getFolderItemsFn>>

function toStorageItems(raw: RawFolderItems, folderId: string | null) {
  const folders: StorageItem[] = raw.folders.map((folder) => ({
    id: folder.id,
    name: folder.name,
    type: 'folder',
    userId: '',
    parentFolderId: folder.parentFolderId ?? null,
    createdAt: new Date(folder.createdAt),
    updatedAt: new Date(folder.createdAt),
    isPrivatelyLocked: Boolean(folder.isPrivatelyLocked),
  }))
  const files: StorageItem[] = raw.files.map((file) => ({
    id: file.id,
    name: file.name,
    type: 'file',
    userId: '',
    folderId,
    objectKey: file.objectKey,
    mimeType: file.mimeType ?? null,
    sizeInBytes: file.sizeInBytes,
    createdAt: new Date(file.createdAt),
    updatedAt: new Date(file.createdAt),
    isPrivatelyLocked: Boolean(file.isPrivatelyLocked),
  }))
  return [...folders, ...files]
}

export function folderItemsQuery(folderId: string | null) {
  return infiniteQueryOptions({
    queryKey: STORAGE_QUERY_KEYS.folderItems(folderId),
    queryFn: async ({ pageParam }): Promise<FolderPage> => {
      const raw = await getFolderItemsFn({
        data: { folderId, page: pageParam, limit: FOLDER_PAGE_SIZE },
      })
      return {
        items: toStorageItems(raw, folderId),
        breadcrumbs: raw.breadcrumbs.map((crumb) => ({ ...crumb, path: '' })),
        page: pageParam,
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.items.length < FOLDER_PAGE_SIZE ? undefined : lastPage.page + 1,
  })
}

export function quotaQuery() {
  return queryOptions({
    queryKey: STORAGE_QUERY_KEYS.quota,
    queryFn: () => getUserQuotaSnapshotFn(),
  })
}

/** Flattens the pages of a folder query, dropping duplicates across pages. */
export function flattenFolderPages(data: InfiniteData<FolderPage>) {
  const seen = new Set<string>()
  const items: StorageItem[] = []
  for (const page of data.pages) {
    for (const item of page.items) {
      if (seen.has(item.id)) continue
      seen.add(item.id)
      items.push(item)
    }
  }
  return {
    items,
    breadcrumbs: data.pages[0]?.breadcrumbs ?? [],
  }
}

// ---------------------------------------------------------------------------
// Cache helpers used by mutations (optimistic updates + refresh)
// ---------------------------------------------------------------------------

type ItemsUpdater = (items: StorageItem[]) => StorageItem[]

/**
 * Applies `update` to the cached items of a folder. The updater receives the
 * items of the first page (new items are added there); for removals/renames
 * every page is updated.
 */
export function updateFolderItems(
  queryClient: QueryClient,
  folderId: string | null,
  update: ItemsUpdater,
) {
  queryClient.setQueryData(
    folderItemsQuery(folderId).queryKey,
    (data) => {
      if (!data) return data
      return {
        ...data,
        pages: data.pages.map((page, index) =>
          index === 0
            ? { ...page, items: update(page.items) }
            : { ...page, items: removeMissing(page.items, update) },
        ),
      }
    },
  )
}

/** For pages after the first: keep renames/removals, ignore additions. */
function removeMissing(items: StorageItem[], update: ItemsUpdater) {
  const originalIds = new Set(items.map((item) => item.id))
  return update(items).filter((item) => originalIds.has(item.id))
}

export function removeFolderItems(
  queryClient: QueryClient,
  folderId: string | null,
  ids: Iterable<string>,
) {
  const idSet = new Set(ids)
  updateFolderItems(queryClient, folderId, (items) =>
    items.filter((item) => !idSet.has(item.id)),
  )
}

/** Adds an item to the top of the folder unless it is already listed. */
export function addFolderItem(
  queryClient: QueryClient,
  folderId: string | null,
  item: StorageItem,
) {
  updateFolderItems(queryClient, folderId, (items) =>
    items.some((existing) => existing.id === item.id)
      ? items
      : [item, ...items],
  )
}

/** Refetches a folder (and the quota, which most mutations change). */
export function refreshFolder(
  queryClient: QueryClient,
  folderId: string | null,
) {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: folderItemsQuery(folderId).queryKey,
    }),
    queryClient.invalidateQueries({ queryKey: STORAGE_QUERY_KEYS.quota }),
  ])
}

/** Refetches every cached folder, e.g. after a move between folders. */
export function refreshAllFolders(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: STORAGE_QUERY_KEYS.allFolders }),
    queryClient.invalidateQueries({ queryKey: STORAGE_QUERY_KEYS.quota }),
  ])
}
