import { useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { PaginatedThreads, ChatThreadSnapshot } from './-chat-types'
import { chatQueryKeys } from './-chat-query-keys'

export function filterThreads(threads: ChatThreadSnapshot[], query: string) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return threads
  return threads.filter((thread) => {
    const text = `${thread.title} ${thread.latestPreview ?? ''}`.toLowerCase()
    return text.includes(normalized)
  })
}

export function useThreadPages(threadPage: number, queryVersion: unknown) {
  const queryClient = useQueryClient()
  return useMemo(() => {
    const pages: PaginatedThreads[] = []
    for (let page = 1; page <= threadPage; page += 1) {
      const data = queryClient.getQueryData<PaginatedThreads>([
        ...chatQueryKeys.threads,
        page,
      ])
      if (data) {
        pages.push(data)
      }
    }
    return pages
  }, [queryClient, threadPage, queryVersion])
}

export function useFlatThreads(pages: PaginatedThreads[]) {
  return useMemo(() => {
    const map = new Map<string, ChatThreadSnapshot>()
    for (const page of pages) {
      for (const thread of page.items) {
        map.set(thread.id, thread)
      }
    }
    return Array.from(map.values()).sort((left, right) =>
      right.lastMessageAt.localeCompare(left.lastMessageAt),
    )
  }, [pages])
}
