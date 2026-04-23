import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/ui/sonner'
import { chatQueryKeys } from './-chat-query-keys'
import type { ChatRouteSnapshot, PaginatedThreads } from './-chat-types'

// Dynamically load server functions
async function loadCreateChatThreadFn() {
  const mod = await import('./-chat-thread-server')
  return mod.createChatThreadFn
}

async function loadDeleteChatThreadFn() {
  const mod = await import('./-chat-thread-server')
  return mod.deleteChatThreadFn
}

async function loadRenameChatThreadFn() {
  const mod = await import('./-chat-thread-server')
  return mod.renameChatThreadFn
}

type ThreadActionsParams = {
  initial: ChatRouteSnapshot
  activeThreadId: string | null
  activeThreadList: { id: string }[]
  deleteTargetId: string | null
  setActiveThreadId: (threadId: string | null) => void
  setComposerValue: (value: string) => void
  setIsComposingNewThread: (value: boolean) => void
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
  setComposerValue,
  setIsComposingNewThread,
  setDeleteTargetId,
  setRenameTargetId,
  setSheetOpen,
}: ThreadActionsParams) {
  const queryClient = useQueryClient()

  const createThreadMutation = useMutation({
    mutationFn: async () => {
      const fn = await loadCreateChatThreadFn()
      return fn({ data: { title: 'New Chat' } })
    },
    onSuccess: (result) => {
      queryClient.setQueryData<PaginatedThreads>(
        [...chatQueryKeys.threads, 1],
        (old) => {
          const base = old ?? initial.threads
          return {
            ...base,
            items: [result.thread, ...base.items],
          }
        },
      )
      setActiveThreadId(result.thread.id)
      setIsComposingNewThread(false)
      setComposerValue('')
      setSheetOpen(false)
      toast.success('New chat created.')
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create thread.',
      )
    },
  })

  const startNewThread = () => {
    createThreadMutation.mutate()
  }

  const renameThreadMutation = useMutation({
    mutationFn: async (payload: { threadId: string; title: string }) => {
      const fn = await loadRenameChatThreadFn()
      return fn({ data: payload })
    },
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
      setIsComposingNewThread(false)
      toast.success('Thread renamed.')
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to rename thread.',
      )
    },
  })

  const deleteThreadMutation = useMutation({
    mutationFn: async (threadId: string) => {
      const fn = await loadDeleteChatThreadFn()
      return fn({ data: { threadId } })
    },
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
      setIsComposingNewThread(false)
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
    startNewThread,
    renameThreadMutation,
    deleteThreadMutation,
  }
}
