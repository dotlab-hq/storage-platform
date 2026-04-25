import { useCallback, useEffect, useMemo, useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import type {
  StorageItem,
  StorageFolder,
  BreadcrumbItem,
} from '@/types/storage'
import { mapItems } from '@/hooks/storage-data-mapper'

type RawFolder = {
  id: string
  name: string
  createdAt: string | Date
  parentFolderId: string | null
  isPrivatelyLocked?: boolean
}

type RawFile = {
  id: string
  name: string
  sizeInBytes: number
  mimeType?: string | null
  objectKey?: string
  createdAt: string | Date
  isPrivatelyLocked?: boolean
}

type UserFolderApiResponse = {
  folders: RawFolder[]
  files: RawFile[]
  breadcrumbs: Array<{ id: string; name: string }>
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
    const error = await response
      .json()
      .catch(() => ({ error: 'Failed to load items' }))
    throw new Error(error.error ?? 'Failed to load items')
  }

  return response.json()
}

export function useUserContents(userId: string, open: boolean) {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setCurrentFolderId(null)
    }
  }, [open])

  const query = useInfiniteQuery({
    queryKey: ['admin-user-contents', userId, currentFolderId],
    queryFn: async ({ pageParam = 1 }) => {
      return loadUserFolderItems({
        userId,
        folderId: currentFolderId,
        page: pageParam,
        limit: 100,
      })
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextPage : undefined,
    enabled: open && !!userId,
    staleTime: 15_000,
  })

  const items = useMemo((): StorageItem[] => {
    const allItems: StorageItem[] = []
    for (const page of query.data?.pages ?? []) {
      const mapped = mapItems(
        {
          folders: page.folders,
          files: page.files,
          breadcrumbs: page.breadcrumbs,
        },
        userId,
      )
      allItems.push(...mapped.items)
    }
    return allItems
  }, [query.data?.pages, userId])

  const folders = useMemo((): StorageFolder[] => {
    const allFolders: StorageFolder[] = []
    for (const page of query.data?.pages ?? []) {
      const mapped = mapItems(
        {
          folders: page.folders,
          files: page.files,
          breadcrumbs: page.breadcrumbs,
        },
        userId,
      )
      allFolders.push(...mapped.folders)
    }
    return allFolders
  }, [query.data?.pages, userId])

  const breadcrumbs = useMemo((): BreadcrumbItem[] => {
    if (!query.data?.pages.length) return []
    const latest = query.data.pages[query.data.pages.length - 1]
    return latest.breadcrumbs.map((b) => ({
      id: b.id,
      name: b.name,
      path: '',
    }))
  }, [query.data?.pages])

  const hasMore = useMemo(() => {
    const lastPage = query.data?.pages.at(-1)
    return lastPage?.hasMore ?? false
  }, [query.data?.pages])

  const loadMore = useCallback(async () => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      await query.fetchNextPage()
    }
  }, [query.hasNextPage, query.isFetchingNextPage, query.fetchNextPage])

  const openFolder = useCallback((folderId: string | null) => {
    setCurrentFolderId(folderId)
  }, [])

  const refresh = useCallback(async () => {
    await query.refetch()
  }, [query])

  return {
    items,
    folders,
    breadcrumbs,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    error: query.error,
    loadMore,
    openFolder,
    refresh,
    currentFolderId,
  }
}

export type UseUserContentsResult = ReturnType<typeof useUserContents>
