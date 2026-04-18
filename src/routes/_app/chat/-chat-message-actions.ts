import { useCallback, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/ui/sonner'
import {
  deleteMessageFn,
  regenerateMessageFn,
} from './-chat-message-mutations-server'
import { chatQueryKeys } from './-chat-query-keys'
import { updateChatUi } from './-chat-store'
import type {
  ChatRouteSnapshot,
  ChatMessageSnapshot,
  PaginatedMessages,
} from './-chat-types'

const MESSAGE_PAGE_LIMIT = 30

type MessageActionsParams = {
  initial: ChatRouteSnapshot
  activeThreadId: string | null
  setActiveThreadId: ( threadId: string | null ) => void
  setIsComposingNewThread: ( value: boolean ) => void
  setSheetOpen: ( open: boolean ) => void
  setComposerValue: ( value: string ) => void
}

function removeMessageById(
  current: PaginatedMessages | undefined,
  messageId: string,
): PaginatedMessages | undefined {
  if ( !current ) return current
  return {
    ...current,
    items: current.items.filter( ( item ) => item.id !== messageId ),
  }
}

export function useChatMessageActions( {
  initial,
  activeThreadId,
  setActiveThreadId,
  setIsComposingNewThread,
  setSheetOpen,
  setComposerValue,
}: MessageActionsParams ) {
  const queryClient = useQueryClient()
  const abortControllerRef = useRef<AbortController | null>( null )
  const optimisticMessageIdsRef = useRef<{
    userId: string
    assistantId: string
  } | null>( null )

  const sendStreamingMessage = useCallback(
    async ( content: string ) => {
      const threadId = activeThreadId ?? null
      const now = new Date()

      // Create optimistic user message
      const optimisticUserId = `temp-user-${Date.now()}`
      const optimisticAssistantId = `temp-assistant-${Date.now()}`
      optimisticMessageIdsRef.current = { userId: optimisticUserId, assistantId: optimisticAssistantId }

      const optimisticUserMessage: ChatMessageSnapshot = {
        id: optimisticUserId,
        threadId: threadId || 'temp-thread',
        role: 'user',
        content,
        regenerationCount: 0,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      }

      const optimisticAssistantMessage: ChatMessageSnapshot = {
        id: optimisticAssistantId,
        threadId: threadId || 'temp-thread',
        role: 'assistant',
        content: '',
        regenerationCount: 0,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      }

      // Update UI with optimistic messages
      queryClient.setQueryData<PaginatedMessages>(
        [...chatQueryKeys.messages( threadId || 'temp' ), 1],
        ( old ) => {
          const base = old ?? {
            items: [],
            page: 1,
            limit: MESSAGE_PAGE_LIMIT,
            hasMore: false,
          }
          return {
            ...base,
            items: [...base.items, optimisticUserMessage, optimisticAssistantMessage],
          }
        },
      )

      setComposerValue( '' )
      updateChatUi( { streamingMessageId: optimisticAssistantId } )

      const abortController = new AbortController()
      abortControllerRef.current = abortController

      try {
        const response = await fetch( '/api/chat/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify( {
            threadId: threadId ?? undefined,
            content,
          } ),
          signal: abortController.signal,
        } )

        if ( !response.ok ) {
          throw new Error( 'Stream request failed' )
        }

        if ( !response.body ) {
          throw new Error( 'No response body' )
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let realThreadId: string | null = null
        let realMessageId: string | null = null

        while ( true ) {
          try {
            const { done, value } = await reader.read()
            if ( done ) break

            buffer += decoder.decode( value, { stream: true } )
            const lines = buffer.split( '\n' )

            for ( let i = 0; i < lines.length - 1; i++ ) {
              const line = lines[i]
              if ( line.startsWith( 'data: ' ) ) {
                try {
                  const data = JSON.parse( line.slice( 6 ) )

                  if ( data.done ) {
                    // Stream complete
                    realMessageId = data.id
                    realThreadId = data.threadId || threadId

                    queryClient.setQueryData<PaginatedMessages>(
                      [...chatQueryKeys.messages( realThreadId || 'temp' ), 1],
                      ( old ) => {
                        if ( !old ) return old
                        return {
                          ...old,
                          items: old.items.map( ( item ) =>
                            item.id === optimisticAssistantId
                              ? {
                                ...item,
                                id: realMessageId!,
                                threadId: realThreadId!,
                                content: data.content,
                              }
                              : item.id === optimisticUserId
                                ? { ...item, threadId: realThreadId! }
                                : item,
                          ),
                        }
                      },
                    )

                    if ( realThreadId ) {
                      setActiveThreadId( realThreadId )
                    }

                    updateChatUi( { streamingMessageId: null } )
                  } else if ( data.chunk ) {
                    // Stream chunk
                    realMessageId = data.id
                    queryClient.setQueryData<PaginatedMessages>(
                      [...chatQueryKeys.messages( threadId || 'temp' ), 1],
                      ( old ) => {
                        if ( !old ) return old
                        return {
                          ...old,
                          items: old.items.map( ( item ) =>
                            item.id === optimisticAssistantId
                              ? {
                                ...item,
                                content: item.content + data.chunk,
                              }
                              : item,
                          ),
                        }
                      },
                    )
                  } else if ( data.error ) {
                    throw new Error( data.error )
                  }
                } catch ( parseError ) {
                  console.error( '[Chat] Parse error:', parseError )
                }
              }
            }

            buffer = lines[lines.length - 1]
          } catch ( readError ) {
            if ( readError instanceof Error && readError.name === 'AbortError' ) {
              break
            }
            throw readError
          }
        }

        setIsComposingNewThread( false )
        setSheetOpen( false )
      } catch ( error ) {
        if ( error instanceof Error && error.name !== 'AbortError' ) {
          console.error( '[Chat] Stream error:', error )
          toast.error(
            error instanceof Error ? error.message : 'Failed to send message.',
          )

          // Remove optimistic messages on error
          queryClient.setQueryData<PaginatedMessages>(
            [...chatQueryKeys.messages( threadId || 'temp' ), 1],
            ( old ) =>
              removeMessageById(
                removeMessageById( old, optimisticUserId ),
                optimisticAssistantId,
              ),
          )
        }

        updateChatUi( { streamingMessageId: null } )
        abortControllerRef.current = null
      }
    },
    [activeThreadId, queryClient, setActiveThreadId, setIsComposingNewThread, setSheetOpen, setComposerValue],
  )

  const sendMutation = useMutation( {
    mutationFn: async ( content: string ) => {
      await sendStreamingMessage( content )
    },
  } )

  const regenerateMutation = useMutation( {
    mutationFn: async ( messageId: string ) =>
      regenerateMessageFn( { data: { messageId } } ),
    onSuccess: ( result ) => {
      if ( !activeThreadId ) return
      queryClient.setQueryData<PaginatedMessages>(
        [...chatQueryKeys.messages( activeThreadId ), 1],
        ( old ) => {
          if ( !old ) return old
          return {
            ...old,
            items: old.items.map( ( item ) =>
              item.id === result.message.id ? result.message : item,
            ),
          }
        },
      )
      toast.success( 'Response regenerated.' )
    },
    onError: ( error ) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to regenerate.',
      )
    },
  } )

  const deleteMessageMutation = useMutation( {
    mutationFn: async ( messageId: string ) =>
      deleteMessageFn( { data: { messageId } } ),
    onSuccess: ( _result, messageId ) => {
      if ( !activeThreadId ) return
      queryClient.setQueryData<PaginatedMessages>(
        [...chatQueryKeys.messages( activeThreadId ), 1],
        ( old ) => removeMessageById( old, messageId ),
      )
      toast.success( 'Message deleted.' )
    },
    onError: ( error ) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete message.',
      )
    },
  } )

  const stopStreaming = useCallback( () => {
    if ( abortControllerRef.current ) {
      abortControllerRef.current.abort()
      updateChatUi( { streamingMessageId: null } )
      abortControllerRef.current = null
    }
  }, [] )

  const submitMessage = useCallback(
    ( value: string ) => {
      const content = value.trim()
      if ( !content ) return
      sendMutation.mutate( content )
    },
    [sendMutation],
  )

  return {
    sendMutation,
    regenerateMutation,
    deleteMessageMutation,
    submitMessage,
    stopStreaming,
  }
}
