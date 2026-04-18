import { useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { ChatMessageSnapshot, PaginatedMessages } from './-chat-types'
import { chatQueryKeys } from './-chat-query-keys'

export function useMessagePages(
  threadId: string | null,
  messagePage: number,
  queryVersion: unknown,
) {
  const queryClient = useQueryClient()
  return useMemo( () => {
    if ( !threadId ) {
      return [] as PaginatedMessages[]
    }
    const pages: PaginatedMessages[] = []
    for ( let page = 1; page <= messagePage; page += 1 ) {
      const data = queryClient.getQueryData<PaginatedMessages>( [
        ...chatQueryKeys.messages( threadId ),
        page,
      ] )
      if ( data ) {
        pages.push( data )
      }
    }
    return pages
  }, [queryClient, threadId, messagePage, queryVersion] )
}

export function useFlatMessages( pages: PaginatedMessages[] ) {
  return useMemo( () => {
    const map = new Map<string, ChatMessageSnapshot>()
    for ( const page of pages ) {
      for ( const message of page.items ) {
        map.set( message.id, message )
      }
    }
    return Array.from( map.values() ).sort( ( left, right ) =>
      new Date( left.createdAt ).getTime() - new Date( right.createdAt ).getTime(),
    )
  }, [pages] )
}
