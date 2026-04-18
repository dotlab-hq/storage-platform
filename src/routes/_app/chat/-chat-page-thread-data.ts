import { useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { PaginatedThreads, ChatThreadSnapshot } from './-chat-types'
import { chatQueryKeys } from './-chat-query-keys'

const SEARCH_STOP_WORDS = new Set( [
  'a',
  'an',
  'and',
  'are',
  'for',
  'have',
  'i',
  'is',
  'of',
  'or',
  'the',
  'to',
] )

function normalizeSearchText( value: string ): string {
  return value.trim().toLowerCase().replace( /\s+/g, ' ' )
}

function tokenizeQuery( value: string ): string[] {
  const normalized = normalizeSearchText( value ).replace( /[^a-z0-9\s]/g, ' ' )
  return normalized
    .split( ' ' )
    .filter( ( token ) => token.length > 0 && !SEARCH_STOP_WORDS.has( token ) )
}

export function filterThreads( threads: ChatThreadSnapshot[], query: string ) {
  const normalized = normalizeSearchText( query )
  if ( !normalized ) {
    return threads
  }

  const tokens = tokenizeQuery( query )

  return threads.filter( ( thread ) => {
    const text = normalizeSearchText(
      `${thread.title} ${thread.latestPreview ?? ''}`,
    )
    if ( tokens.length === 0 ) {
      return text.includes( normalized )
    }
    return tokens.every( ( token ) => text.includes( token ) )
  } )
}

export function useThreadPages( threadPage: number, queryVersion: unknown ) {
  const queryClient = useQueryClient()
  return useMemo( () => {
    const pages: PaginatedThreads[] = []
    for ( let page = 1; page <= threadPage; page += 1 ) {
      const data = queryClient.getQueryData<PaginatedThreads>( [
        ...chatQueryKeys.threads,
        page,
      ] )
      if ( data ) {
        pages.push( data )
      }
    }
    return pages
  }, [queryClient, threadPage, queryVersion] )
}

export function useFlatThreads( pages: PaginatedThreads[] ) {
  return useMemo( () => {
    const map = new Map<string, ChatThreadSnapshot>()
    for ( const page of pages ) {
      for ( const thread of page.items ) {
        map.set( thread.id, thread )
      }
    }
    return Array.from( map.values() ).sort( ( left, right ) =>
      new Date( right.lastMessageAt ).getTime() - new Date( left.lastMessageAt ).getTime(),
    )
  }, [pages] )
}
