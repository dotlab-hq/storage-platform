import { useCallback } from 'react'
import { updateChatUi, useChatUiStore } from './-chat-store'

type UseStreamChatMessageProps = {
    onSuccess?: ( threadId: string ) => void
    onError?: ( error: Error ) => void
}

export function useStreamChatMessage( {
    onSuccess,
    onError,
}: UseStreamChatMessageProps = {} ) {
    const streamingMessageId = useChatUiStore( ( state ) => state.streamingMessageId )

    const stopStreaming = useCallback( () => {
        updateChatUi( {
            streamingMessageId: null,
        } )
    }, [] )

    return {
        stopStreaming,
        isStreaming: streamingMessageId !== null,
    }
}
