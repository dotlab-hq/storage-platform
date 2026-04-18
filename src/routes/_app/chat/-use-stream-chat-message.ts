import { useCallback, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateChatUi, useChatUiStore } from './-chat-store'
import { sendChatMessageFn } from './-chat-message-send-server'
import { chatQueryKeys } from './-chat-query-keys'

type UseStreamChatMessageProps = {
    onSuccess?: ( threadId: string ) => void
    onError?: ( error: Error ) => void
}

export function useStreamChatMessage( {
    onSuccess,
    onError,
}: UseStreamChatMessageProps = {} ) {
    const queryClient = useQueryClient()
    const streamingMessageId = useChatUiStore( ( state ) => state.streamingMessageId )
    const abortControllerRef = useRef<AbortController | null>( null )

    const sendMessageMutation = useMutation( {
        mutationFn: async ( input: {
            content: string
            threadId?: string
        } ) => {
            return sendChatMessageFn( {
                data: input,
            } )
        },
        onSuccess: ( result ) => {
            // Invalidate queries to refetch
            queryClient.invalidateQueries( {
                queryKey: chatQueryKeys.messages( result.thread.id ),
            } )
            queryClient.invalidateQueries( {
                queryKey: chatQueryKeys.threads,
            } )

            onSuccess?.( result.thread.id )
        },
        onError: ( error ) => {
            const err = error instanceof Error ? error : new Error( String( error ) )
            onError?.( err )
        },
    } )

    const submitMessage = useCallback(
        async ( content: string, threadId: string | null = null ) => {
            // Create abort controller for this request
            const abortController = new AbortController()
            abortControllerRef.current = abortController

            // Create a placeholder message ID for streaming tracking
            const messageId = `streaming-${Date.now()}`
            updateChatUi( {
                streamingMessageId: messageId,
                composerValue: '',
            } )

            try {
                await sendMessageMutation.mutateAsync( {
                    content,
                    threadId: threadId ?? undefined,
                } )

                updateChatUi( {
                    streamingMessageId: null,
                    isComposingNewThread: false,
                    activeThreadId: threadId,
                } )
            } catch ( error ) {
                if ( error instanceof Error && error.name === 'AbortError' ) {
                    // User cancelled
                    console.log( '[Chat] Message submission cancelled' )
                } else {
                    console.error( '[Chat] Message submission error:', error )
                }
                updateChatUi( {
                    streamingMessageId: null,
                } )
                throw error
            } finally {
                abortControllerRef.current = null
            }
        },
        [sendMessageMutation],
    )

    const stopStreaming = useCallback( () => {
        if ( abortControllerRef.current ) {
            abortControllerRef.current.abort()
            updateChatUi( {
                streamingMessageId: null,
            } )
        }
    }, [] )

    return {
        submitMessage,
        stopStreaming,
        isStreaming: streamingMessageId !== null,
        isPending: sendMessageMutation.isPending,
        isError: sendMessageMutation.isError,
        error: sendMessageMutation.error,
    }
}
