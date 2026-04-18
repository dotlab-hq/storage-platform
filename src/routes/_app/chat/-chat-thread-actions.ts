import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/ui/sonner'
import {
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
  setActiveThreadId: ( threadId: string | null ) => void
  setComposerValue: ( value: string ) => void
  setIsComposingNewThread: ( value: boolean ) => void
  setDeleteTargetId: ( threadId: string | null ) => void
  setRenameTargetId: ( threadId: string | null ) => void
  setSheetOpen: ( open: boolean ) => void
}

function removeThreadById(
  current: PaginatedThreads | undefined,
  initial: ChatRouteSnapshot,
  threadId: string,
) {
  const base = current ?? initial.threads
  return {
    ...base,
    items: base.items.filter( ( item ) => item.id !== threadId ),
  }
}

export function useChatThreadActions( {
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
}: ThreadActionsParams ) {
  const queryClient = useQueryClient()

  const startNewThread = () => {
    setActiveThreadId( null )
    setIsComposingNewThread( true )
    setDeleteTargetId( null )
    setRenameTargetId( null )
    setComposerValue( '' )
    setSheetOpen( false )
  }

  const renameThreadMutation = useMutation( {
    mutationFn: async ( payload: { threadId: string; title: string } ) =>
      renameChatThreadFn( { data: payload } ),
    onSuccess: ( result ) => {
      queryClient.setQueryData<PaginatedThreads>(
        [...chatQueryKeys.threads, 1],
        ( old ) => {
          if ( !old ) return old
          return {
            ...old,
            items: old.items.map( ( item ) =>
              item.id === result.thread.id ? result.thread : item,
            ),
          }
        },
      )
      setRenameTargetId( null )
      setIsComposingNewThread( false )
      toast.success( 'Thread renamed.' )
    },
    onError: ( error ) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to rename thread.',
      )
    },
  } )

  const deleteThreadMutation = useMutation( {
    mutationFn: async ( threadId: string ) =>
      deleteChatThreadFn( { data: { threadId } } ),
    onSuccess: () => {
      if ( !deleteTargetId ) return
      queryClient.setQueryData<PaginatedThreads>(
        [...chatQueryKeys.threads, 1],
        ( old ) => removeThreadById( old, initial, deleteTargetId ),
      )
      if ( activeThreadId === deleteTargetId ) {
        const next = activeThreadList.find( ( item ) => item.id !== deleteTargetId )
        setActiveThreadId( next?.id ?? null )
      }
      setIsComposingNewThread( false )
      setDeleteTargetId( null )
      toast.success( 'Thread deleted.' )
    },
    onError: ( error ) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete thread.',
      )
    },
  } )

  return {
    startNewThread,
    renameThreadMutation,
    deleteThreadMutation,
  }
}
