import { useCallback, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/ui/sonner'
import { chatQueryKeys } from './-chat-query-keys'
import { updateChatUi } from './-chat-store'
import { consumeSseEvents } from './-chat-stream-events'
import type { ChatMessageSnapshot, PaginatedMessages } from './-chat-types'

// Dynamically load server functions
async function loadDeleteMessageFn() {
  const mod = await import('./-chat-message-mutations-server')
  return mod.deleteMessageFn
}

async function loadRegenerateMessageFn() {
  const mod = await import('./-chat-message-mutations-server')
  return mod.regenerateMessageFn
}

const MESSAGE_PAGE_LIMIT = 30

type MessageActionsParams = {
  activeThreadId: string | null
  setActiveThreadId: (threadId: string | null) => void
  setIsComposingNewThread: (value: boolean) => void
  setSheetOpen: (open: boolean) => void
  setComposerValue: (value: string) => void
}

function removeMessageById(
  current: PaginatedMessages | undefined,
  messageId: string,
): PaginatedMessages | undefined {
  if (!current) return current
  return {
    ...current,
    items: current.items.filter((item) => item.id !== messageId),
  }
}

export function useChatMessageActions({
  activeThreadId,
  setActiveThreadId,
  setIsComposingNewThread,
  setSheetOpen,
  setComposerValue,
}: MessageActionsParams) {
  const queryClient = useQueryClient()
  const abortControllerRef = useRef<AbortController | null>(null)
  const optimisticMessageIdsRef = useRef<{
    userId: string
    assistantId: string
  } | null>(null)

  const sendStreamingMessage = useCallback(
    async (content: string) => {
      const threadId = activeThreadId ?? null
      const optimisticThreadId = threadId ?? 'temp'
      const now = new Date()

      // Create optimistic user message
      const optimisticUserId = `temp-user-${Date.now()}`
      const optimisticAssistantId = `temp-assistant-${Date.now()}`
      optimisticMessageIdsRef.current = {
        userId: optimisticUserId,
        assistantId: optimisticAssistantId,
      }

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
        [...chatQueryKeys.messages(optimisticThreadId), 1],
        (old) => {
          const base = old ?? {
            items: [],
            page: 1,
            limit: MESSAGE_PAGE_LIMIT,
            hasMore: false,
          }
          return {
            ...base,
            items: [
              ...base.items,
              optimisticUserMessage,
              optimisticAssistantMessage,
            ],
          }
        },
      )

      setComposerValue('')
      updateChatUi({ streamingMessageId: optimisticAssistantId })

      const abortController = new AbortController()
      abortControllerRef.current = abortController

      try {
        const response = await fetch('/api/chat/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            threadId: threadId ?? undefined,
            content,
          }),
          signal: abortController.signal,
        })

        if (!response.ok) {
          throw new Error('Stream request failed')
        }

        if (!response.body) {
          throw new Error('No response body')
        }

        let realThreadId: string | null = response.headers.get('X-Thread-Id')
        let realMessageId: string | null = response.headers.get(
          'X-Assistant-Message-Id',
        )

        if (!realThreadId) {
          realThreadId = threadId
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        const commitDoneState = () => {
          const finalThreadId = realThreadId ?? threadId
          const sourceThreadId = optimisticThreadId
          const sourceKey = [
            ...chatQueryKeys.messages(sourceThreadId),
            1,
          ] as const
          const sourceData =
            queryClient.getQueryData<PaginatedMessages>(sourceKey)

          if (!sourceData) {
            updateChatUi({ streamingMessageId: null })
            return
          }

          const destinationThreadId = finalThreadId ?? sourceThreadId
          const destinationKey = [
            ...chatQueryKeys.messages(destinationThreadId),
            1,
          ] as const

          queryClient.setQueryData<PaginatedMessages>(destinationKey, {
            ...sourceData,
            items: sourceData.items.map((item) =>
              item.id === optimisticAssistantId
                ? {
                    ...item,
                    id: realMessageId ?? item.id,
                    threadId: destinationThreadId,
                  }
                : item.id === optimisticUserId
                  ? { ...item, threadId: destinationThreadId }
                  : item,
            ),
          })

          if (destinationThreadId !== sourceThreadId) {
            queryClient.removeQueries({ queryKey: sourceKey, exact: true })
          }

          if (destinationThreadId) {
            setActiveThreadId(destinationThreadId)
          }

          updateChatUi({ streamingMessageId: null })
        }

        let didComplete = false

        let keepReading = true
        while (keepReading) {
          try {
            const { done, value } = await reader.read()
            if (done) {
              keepReading = false
              continue
            }

            buffer += decoder.decode(value, { stream: true })

            const parsed = consumeSseEvents(buffer)
            buffer = parsed.rest

            for (const event of parsed.events) {
              if (event.type === 'error') {
                throw new Error(event.message)
              }

              if (event.messageId && !realMessageId) {
                realMessageId = event.messageId
              }

              if (event.type === 'done') {
                didComplete = true
                commitDoneState()
                continue
              }

              queryClient.setQueryData<PaginatedMessages>(
                [...chatQueryKeys.messages(optimisticThreadId), 1],
                (old) => {
                  if (!old) return old
                  return {
                    ...old,
                    items: old.items.map((item) =>
                      item.id === optimisticAssistantId
                        ? {
                            ...item,
                            content: item.content + event.chunk,
                          }
                        : item,
                    ),
                  }
                },
              )
            }
          } catch (readError) {
            if (readError instanceof Error && readError.name === 'AbortError') {
              break
            }
            throw readError
          }
        }

        if (!didComplete) {
          commitDoneState()
        }

        queryClient.invalidateQueries({ queryKey: chatQueryKeys.threads })
        if (realThreadId) {
          queryClient.invalidateQueries({
            queryKey: chatQueryKeys.messages(realThreadId),
          })
        }

        setIsComposingNewThread(false)
        setSheetOpen(false)
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('[Chat] Stream error:', error)
          toast.error(
            error instanceof Error ? error.message : 'Failed to send message.',
          )

          // Remove optimistic messages on error
          queryClient.setQueryData<PaginatedMessages>(
            [...chatQueryKeys.messages(optimisticThreadId), 1],
            (old) =>
              removeMessageById(
                removeMessageById(old, optimisticUserId),
                optimisticAssistantId,
              ),
          )
        }

        updateChatUi({ streamingMessageId: null })
        abortControllerRef.current = null
      }
    },
    [
      activeThreadId,
      queryClient,
      setActiveThreadId,
      setIsComposingNewThread,
      setSheetOpen,
      setComposerValue,
    ],
  )

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      await sendStreamingMessage(content)
    },
  })

  const regenerateMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const fn = await loadRegenerateMessageFn()
      return fn({ data: { messageId } })
    },
    onSuccess: (result) => {
      if (!activeThreadId) return
      queryClient.setQueryData<PaginatedMessages>(
        [...chatQueryKeys.messages(activeThreadId), 1],
        (old) => {
          if (!old) return old
          return {
            ...old,
            items: old.items.map((item) =>
              item.id === result.message.id ? result.message : item,
            ),
          }
        },
      )
      toast.success('Response regenerated.')
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to regenerate.',
      )
    },
  })

  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const fn = await loadDeleteMessageFn()
      return fn({ data: { messageId } })
    },
    onSuccess: (_result, messageId) => {
      if (!activeThreadId) return
      queryClient.setQueryData<PaginatedMessages>(
        [...chatQueryKeys.messages(activeThreadId), 1],
        (old) => removeMessageById(old, messageId),
      )
      toast.success('Message deleted.')
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete message.',
      )
    },
  })

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    updateChatUi({ streamingMessageId: null })
  }, [])

  const submitMessage = useCallback(
    (value: string) => {
      const content = value.trim()
      if (!content) return
      sendMutation.mutate(content)
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
