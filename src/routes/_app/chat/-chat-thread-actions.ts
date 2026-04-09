import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/ui/sonner'
import {
  createChatThreadFn,
  deleteChatThreadFn,
  renameChatThreadFn,
} from './-chat-thread-server'
import { chatQueryKeys } from './-chat-query-keys'
import type { ChatRouteSnapshot, PaginatedThreads } from './-chat-types'

type ThreadActionsParams = {
  initial: ChatRouteSnapshot
  activeThreadId: string | null
  activeThreadList: { id: string }[]
  deleteTargetId: string | null
  setActiveThreadId: (threadId: string | null) => void
  setDeleteTargetId: (threadId: string | null) => void
  setRenameTargetId: (threadId: string | null) => void
  setSheetOpen: (open: boolean) => void
}

function removeThreadById(
  current: PaginatedThreads | undefined,
  initial: ChatRouteSnapshot,
  threadId: string,
) {
  const base = current ?? initial.threads
  return {
    ...base,
    items: base.items.filter((item) => item.id !== threadId),
  }
}

export function useChatThreadActions({
  initial,
  activeThreadId,
  activeThreadList,
  deleteTargetId,
  setActiveThreadId,
  setDeleteTargetId,
  setRenameTargetId,
  setSheetOpen,
}: ThreadActionsParams) {
  const queryClient = useQueryClient()

  const createThreadMutation = useMutation({
    mutationFn: async () => createChatThreadFn({ data: { title: 'New Chat' } }),
    onSuccess: (result) => {
      queryClient.setQueryData<PaginatedThreads>(
        [...chatQueryKeys.threads, 1],
        (old) => {
          const previous = old ?? initial.threads
          return {
            ...previous,
            items: [
              result.thread,
              ...previous.items.filter((item) => item.id !== result.thread.id),
            ],
          }
        },
      )
      setActiveThreadId(result.thread.id)
      setSheetOpen(false)
      toast.success('New thread created.')
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create thread.',
      )
    },
  })

  const renameThreadMutation = useMutation({
    mutationFn: async (payload: { threadId: string; title: string }) =>
      renameChatThreadFn({ data: payload }),
    onSuccess: (result) => {
      queryClient.setQueryData<PaginatedThreads>(
        [...chatQueryKeys.threads, 1],
        (old) => {
          if (!old) return old
          return {
            ...old,
            items: old.items.map((item) =>
              item.id === result.thread.id ? result.thread : item,
            ),
          }
        },
      )
      setRenameTargetId(null)
      toast.success('Thread renamed.')
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to rename thread.',
      )
    },
  })

  const deleteThreadMutation = useMutation({
    mutationFn: async (threadId: string) =>
      deleteChatThreadFn({ data: { threadId } }),
    onSuccess: () => {
      if (!deleteTargetId) return
      queryClient.setQueryData<PaginatedThreads>(
        [...chatQueryKeys.threads, 1],
        (old) => removeThreadById(old, initial, deleteTargetId),
      )
      if (activeThreadId === deleteTargetId) {
        const next = activeThreadList.find((item) => item.id !== deleteTargetId)
        setActiveThreadId(next?.id ?? null)
      }
      setDeleteTargetId(null)
      toast.success('Thread deleted.')
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete thread.',
      )
    },
  })

  return {
    createThreadMutation,
    renameThreadMutation,
    deleteThreadMutation,
  }
}
