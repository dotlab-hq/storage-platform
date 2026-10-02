import { useMemo, useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import type { BreadcrumbItem, StorageItem } from '@/types/storage'

type RawFolder = {
  id: string
  name: string
  createdAt: string
  parentFolderId: string | null
  isPrivatelyLocked?: boolean
}

type RawFile = {
  id: string
  name: string
  sizeInBytes: number
  mimeType?: string | null
  objectKey?: string
  createdAt: string
  isPrivatelyLocked?: boolean
}

type UserFolderApiResponse = {
  folders: RawFolder[]
  files: RawFile[]
  breadcrumbs: BreadcrumbItem[]
  hasMore: boolean
  nextPage: number | null
}

async function loadUserFolderItems({
  userId,
  folderId,
  page = 1,
  limit = 100,
}: {
  userId: string
  folderId: string | null
  page?: number
  limit?: number
}): Promise<UserFolderApiResponse> {
  const searchParams = new URLSearchParams()
  if (folderId !== null) {
    searchParams.set('folderId', folderId)
  }
  searchParams.set('page', String(page))
  searchParams.set('limit', String(limit))

  const response = await fetch(
    `/api/admin/users/${encodeURIComponent(userId)}/folder-items?${searchParams.toString()}`,
    {
      credentials: 'include',
    },
  )

  if (!response.ok) {
    const payload = (await response
      .json()
      .catch(() => ({ error: 'Failed to load items' }))) as {
      error?: string
    }
    throw new Error(payload.error ?? 'Failed to load items')
  }

  return response.json()
}

/** Converts one API page into the `StorageItem`s the file grid renders. */
function toStorageItems(
  page: UserFolderApiResponse,
  userId: string,
  folderId: string | null,
) {
  const folders: StorageItem[] = page.folders.map((folder) => ({
    id: folder.id,
    name: folder.name,
    type: 'folder',
    userId,
    parentFolderId: folder.parentFolderId ?? null,
    createdAt: new Date(folder.createdAt),
    updatedAt: new Date(folder.createdAt),
    isPrivatelyLocked: Boolean(folder.isPrivatelyLocked),
  }))
  const files: StorageItem[] = page.files.map((file) => ({
    id: file.id,
    name: file.name,
    type: 'file',
    userId,
    folderId,
    objectKey: file.objectKey ?? '',
    mimeType: file.mimeType ?? null,
    sizeInBytes: file.sizeInBytes,
    createdAt: new Date(file.createdAt),
    updatedAt: new Date(file.createdAt),
    isPrivatelyLocked: Boolean(file.isPrivatelyLocked),
  }))
  return [...folders, ...files]
}

/**
 * Read-only browser over another user's files (admin "View Files"). Mount it
 * only while the viewer is open; the open folder resets on unmount.
 */
export function useUserContents(userId: string, enabled: boolean) {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)

  const query = useInfiniteQuery({
    queryKey: ['admin-user-contents', userId, currentFolderId],
    queryFn: ({ pageParam }) =>
      loadUserFolderItems({
        userId,
        folderId: currentFolderId,
        page: pageParam,
        limit: 100,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? (lastPage.nextPage ?? undefined) : undefined,
    enabled: enabled && userId.length > 0,
    staleTime: 15_000,
  })

  const items = useMemo(
    () =>
      (query.data?.pages ?? []).flatMap((page) =>
        toStorageItems(page, userId, currentFolderId),
      ),
    [query.data?.pages, userId, currentFolderId],
  )

  const breadcrumbs: BreadcrumbItem[] =
    query.data?.pages.at(-1)?.breadcrumbs ?? []

  return {
    items,
    breadcrumbs,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    error: query.error,
    loadMore: () => {
      if (query.hasNextPage && !query.isFetchingNextPage) {
        void query.fetchNextPage()
      }
    },
    openFolder: setCurrentFolderId,
  }
}
