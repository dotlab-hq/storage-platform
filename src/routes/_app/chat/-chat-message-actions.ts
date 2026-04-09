import { useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/ui/sonner'
import { sendChatMessageFn } from './-chat-message-send-server'
import {
  deleteMessageFn,
  regenerateMessageFn,
} from './-chat-message-mutations-server'
import { chatQueryKeys } from './-chat-query-keys'
import type {
  ChatRouteSnapshot,
  PaginatedMessages,
  PaginatedThreads,
} from './-chat-types'

const MESSAGE_PAGE_LIMIT = 30

type MessageActionsParams = {
  initial: ChatRouteSnapshot
  activeThreadId: string | null
  setActiveThreadId: (threadId: string | null) => void
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
  initial,
  activeThreadId,
  setActiveThreadId,
  setSheetOpen,
  setComposerValue,
}: MessageActionsParams) {
  const queryClient = useQueryClient()

  const sendMutation = useMutation({
    mutationFn: async (content: string) =>
      sendChatMessageFn({
        data: { threadId: activeThreadId ?? undefined, content },
      }),
    onSuccess: (result) => {
      queryClient.setQueryData<PaginatedThreads>(
        [...chatQueryKeys.threads, 1],
        (old) => {
          const base = old ?? initial.threads
          return {
            ...base,
            items: [
              result.thread,
              ...base.items.filter((item) => item.id !== result.thread.id),
            ],
          }
        },
      )

      queryClient.setQueryData<PaginatedMessages>(
        [...chatQueryKeys.messages(result.thread.id), 1],
        (old) => {
          const base = old ?? {
            items: [],
            page: 1,
            limit: MESSAGE_PAGE_LIMIT,
            hasMore: false,
          }
          return {
            ...base,
            items: [...base.items, result.userMessage, result.assistantMessage],
          }
        },
      )

      setComposerValue('')
      setActiveThreadId(result.thread.id)
      setSheetOpen(false)
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to send message.',
      )
    },
  })

  const regenerateMutation = useMutation({
    mutationFn: async (messageId: string) =>
      regenerateMessageFn({ data: { messageId } }),
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
    mutationFn: async (messageId: string) =>
      deleteMessageFn({ data: { messageId } }),
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
  }
}
