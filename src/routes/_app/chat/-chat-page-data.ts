import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listThreadMessagesFn } from './-chat-message-queries-server'
import { listChatThreadsFn } from './-chat-thread-server'
import { chatQueryKeys } from './-chat-query-keys'
import { usePaginationObserver } from './-chat-pagination-observers'
import { useFlatMessages, useMessagePages } from './-chat-page-message-data'
import {
  filterThreads,
  useFlatThreads,
  useThreadPages,
} from './-chat-page-thread-data'
import type { ChatRouteSnapshot, PaginatedMessages } from './-chat-types'

const THREAD_PAGE_LIMIT = 20
const MESSAGE_PAGE_LIMIT = 30

function initialMessages(): PaginatedMessages {
  return {
    items: [],
    page: 1,
    limit: MESSAGE_PAGE_LIMIT,
    hasMore: false,
  }
}

type ChatPageDataParams = {
  initial: ChatRouteSnapshot
  activeThreadId: string | null
  isComposingNewThread: boolean
  searchQuery: string
  setActiveThreadId: ( value: string | null ) => void
}

export function useChatPageData( {
  initial,
  activeThreadId,
  isComposingNewThread,
  searchQuery,
  setActiveThreadId,
}: ChatPageDataParams ) {
  const [threadPage, setThreadPage] = useState( 1 )
  const [messagePage, setMessagePage] = useState( 1 )
  const threadLoadRef = useRef<HTMLDivElement | null>( null )
  const messageLoadRef = useRef<HTMLDivElement | null>( null )

  const threadQuery = useQuery( {
    queryKey: [...chatQueryKeys.threads, threadPage],
    queryFn: () =>
      listChatThreadsFn( {
        data: { page: threadPage, limit: THREAD_PAGE_LIMIT },
      } ),
    initialData: threadPage === 1 ? initial.threads : undefined,
  } )

  const threadPages = useThreadPages( threadPage, threadQuery.data )
  const allThreads = useFlatThreads( threadPages )
  const visibleThreads = useMemo(
    () => filterThreads( allThreads, searchQuery ),
    [allThreads, searchQuery],
  )

  useEffect( () => {
    if ( !activeThreadId && !isComposingNewThread && allThreads.length > 0 ) {
      setActiveThreadId( allThreads[0].id )
    }
  }, [activeThreadId, allThreads, isComposingNewThread, setActiveThreadId] )

  const activeThread = useMemo(
    () => allThreads.find( ( thread ) => thread.id === activeThreadId ) ?? null,
    [allThreads, activeThreadId],
  )

  const messageQuery = useQuery( {
    queryKey: [...chatQueryKeys.messages( activeThreadId ), messagePage],
    queryFn: () => {
      if ( !activeThreadId ) {
        return Promise.resolve( initialMessages() )
      }
      return listThreadMessagesFn( {
        data: {
          threadId: activeThreadId,
          page: messagePage,
          limit: MESSAGE_PAGE_LIMIT,
        },
      } )
    },
    enabled: Boolean( activeThreadId ),
  } )

  const messagePages = useMessagePages(
    activeThreadId,
    messagePage,
    messageQuery.data,
  )
  const allMessages = useFlatMessages( messagePages )

  usePaginationObserver( {
    enabled: Boolean( threadPages.at( -1 )?.hasMore ),
    target: threadLoadRef.current,
    isFetching: threadQuery.isFetching,
    onLoadMore: () => setThreadPage( ( value ) => value + 1 ),
    rootMargin: '200px',
  } )

  usePaginationObserver( {
    enabled: Boolean( messagePages.at( -1 )?.hasMore ),
    target: messageLoadRef.current,
    isFetching: messageQuery.isFetching,
    onLoadMore: () => setMessagePage( ( value ) => value + 1 ),
    rootMargin: '260px',
  } )

  useEffect( () => {
    setMessagePage( 1 )
  }, [activeThreadId] )

  return {
    threadPage,
    messagePage,
    threadLoadRef,
    messageLoadRef,
    allThreads,
    visibleThreads,
    activeThread,
    allMessages,
  }
}
