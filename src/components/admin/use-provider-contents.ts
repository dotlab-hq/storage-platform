import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import type { AdminProviderContentsResponse } from '@/lib/admin-provider-browser'

type LoadProviderContentsArgs = {
  providerId: string
  prefix: string
  continuationToken?: string | null
}

async function loadProviderContents({
  providerId,
  prefix,
  continuationToken,
  searchQuery = '',
}: LoadProviderContentsArgs & {
  searchQuery?: string
}): Promise<AdminProviderContentsResponse> {
  const searchParams = new URLSearchParams()
  if (prefix.length > 0) {
    searchParams.set('prefix', prefix)
  }
  if (continuationToken) {
    searchParams.set('continuationToken', continuationToken)
  }
  if (searchQuery.length > 0) {
    searchParams.set('search', searchQuery)
  }

  const response = await fetch(
    `/api/admin/storage-providers/${encodeURIComponent(providerId)}/contents${
      searchParams.toString().length > 0 ? `?${searchParams.toString()}` : ''
    }`,
    {
      credentials: 'include',
    },
  )

  const payload: { error?: string } & Partial<AdminProviderContentsResponse> =
    await response.json()

  if (!response.ok) {
    throw new Error(payload.error ?? 'Failed to load provider contents')
  }

  return payload as AdminProviderContentsResponse
}

export function useProviderContents(providerId: string | null, open: boolean) {
  const [prefix, setPrefix] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!open || !providerId) {
      setPrefix('')
      setSearchQuery('')
    }
  }, [open, providerId])

  const query = useInfiniteQuery({
    queryKey: ['admin-provider-contents', providerId, prefix, searchQuery],
    enabled: open && providerId !== null,
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }) => {
      if (!providerId) {
        throw new Error('Provider is required')
      }
      return loadProviderContents({
        providerId,
        prefix,
        continuationToken: pageParam,
        searchQuery,
      })
    },
    getNextPageParam: (lastPage) =>
      lastPage.isTruncated ? lastPage.nextContinuationToken : undefined,
    staleTime: 15_000,
  })

  const breadcrumbs = useMemo(() => {
    const parts = prefix.split('/').filter((part) => part.length > 0)
    return parts.map((part, index) => ({
      label: part,
      value: `${parts.slice(0, index + 1).join('/')}/`,
    }))
  }, [prefix])

  const folders = useMemo(() => {
    const seen = new Set<string>()
    const mergedFolders: AdminProviderContentsResponse['folders'] = []

    for (const page of query.data?.pages ?? []) {
      for (const folder of page.folders) {
        if (seen.has(folder.prefix)) {
          continue
        }
        seen.add(folder.prefix)
        mergedFolders.push(folder)
      }
    }

    return mergedFolders
  }, [query.data?.pages])

  const files = useMemo(() => {
    const seen = new Set<string>()
    const mergedFiles: AdminProviderContentsResponse['files'] = []

    for (const page of query.data?.pages ?? []) {
      for (const file of page.files) {
        if (seen.has(file.key)) {
          continue
        }
        seen.add(file.key)
        mergedFiles.push(file)
      }
    }

    return mergedFiles
  }, [query.data?.pages])

  const latestPage = query.data?.pages.at(-1) ?? null

  return {
    prefix,
    setPrefix,
    breadcrumbs,
    contents: latestPage,
    folders,
    files,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    error: query.error,
    refresh: async () => {
      await query.refetch()
    },
    loadMore: async () => {
      if (query.hasNextPage && !query.isFetchingNextPage) {
        await query.fetchNextPage()
      }
    },
  }
}
