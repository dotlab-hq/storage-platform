import { useMemo } from 'react'
import { SidebarInset, useSidebar } from '@/components/ui/sidebar'
import { ChatPageHeader } from './-chat-page-header'
import { ChatPageContent } from './-chat-page-content'
import { ChatThreadDeleteDialog } from './-chat-thread-delete-dialog'
import { ChatThreadRenameDialog } from './-chat-thread-rename-dialog'
import { ChatThreadSidebarContent } from './-chat-thread-sidebar-content'
import { useChatThreadActions } from './-chat-thread-actions'
import { useChatMessageActions } from './-chat-message-actions'
import { useChatShellActions } from './-chat-shell-actions'
import { useChatPageData } from './-chat-page-data'
import { useChatPageEvents } from './-chat-page-events'
import { updateChatUi, useChatUiStore } from './-chat-store'
import { useChatStoreSync } from './-chat-store-sync'
import type { ChatRouteSnapshot } from './-chat-types'

type ChatPageProps = {
  initial: ChatRouteSnapshot
}

function pageKey( page: number ): string {
  return `p:${page}`
}

export function ChatPage( { initial }: ChatPageProps ) {
  const { isMobile } = useSidebar()
  const activeThreadId = useChatUiStore( ( state ) => state.activeThreadId )
  const isComposingNewThread = useChatUiStore(
    ( state ) => state.isComposingNewThread,
  )
  const searchQuery = useChatUiStore( ( state ) => state.searchQuery )
  const composerValue = useChatUiStore( ( state ) => state.composerValue )
  const threadPanelOpen = useChatUiStore( ( state ) => state.threadPanelOpen )
  const sheetOpen = useChatUiStore( ( state ) => state.sheetOpen )
  const renameTargetId = useChatUiStore( ( state ) => state.renameTargetId )
  const deleteTargetId = useChatUiStore( ( state ) => state.deleteTargetId )
  const streamingMessageId = useChatUiStore( ( state ) => state.streamingMessageId )
  useChatStoreSync( { initialThreadId: initial.activeThreadId } )

  const {
    threadPage,
    messagePage,
    threadLoadRef,
    messageLoadRef,
    allThreads,
    visibleThreads,
    activeThread,
    allMessages,
  } = useChatPageData( {
    initial,
    activeThreadId,
    isComposingNewThread,
    searchQuery,
    setActiveThreadId: ( value ) => updateChatUi( { activeThreadId: value } ),
  } )

  const renameTarget = useMemo(
    () => allThreads.find( ( thread ) => thread.id === renameTargetId ) ?? null,
    [allThreads, renameTargetId],
  )

  const deleteTarget = useMemo(
    () => allThreads.find( ( thread ) => thread.id === deleteTargetId ) ?? null,
    [allThreads, deleteTargetId],
  )

  const threadActions = useChatThreadActions( {
    initial,
    activeThreadId,
    activeThreadList: allThreads,
    deleteTargetId,
    setActiveThreadId: ( value ) => updateChatUi( { activeThreadId: value } ),
    setComposerValue: ( value ) => updateChatUi( { composerValue: value } ),
    setIsComposingNewThread: ( value ) =>
      updateChatUi( { isComposingNewThread: value } ),
    setDeleteTargetId: ( value ) => updateChatUi( { deleteTargetId: value } ),
    setRenameTargetId: ( value ) => updateChatUi( { renameTargetId: value } ),
    setSheetOpen: ( value ) => updateChatUi( { sheetOpen: value } ),
  } )

  const messageActions = useChatMessageActions( {
    activeThreadId,
    setActiveThreadId: ( value ) => updateChatUi( { activeThreadId: value } ),
    setSheetOpen: ( value ) => updateChatUi( { sheetOpen: value } ),
    setComposerValue: ( value ) => updateChatUi( { composerValue: value } ),
    setIsComposingNewThread: ( value ) =>
      updateChatUi( { isComposingNewThread: value } ),
  } )

  const handleCreateThread = () => {
    messageActions.stopStreaming()
    updateChatUi( { streamingMessageId: null } )
    threadActions.startNewThread()
  }

  useChatShellActions( { hasActiveThread: Boolean( activeThread ) } )
  useChatPageEvents( {
    composerValue,
    onCreateThread: handleCreateThread,
    onSendMessage: messageActions.submitMessage,
  } )

  const sidebarContent = (
    <ChatThreadSidebarContent
      threads={visibleThreads}
      activeThreadId={activeThreadId}
      query={searchQuery}
      onQueryChange={( value ) => updateChatUi( { searchQuery: value } )}
      onSelect={( threadId ) => {
        messageActions.stopStreaming()
        updateChatUi( {
          activeThreadId: threadId,
          isComposingNewThread: false,
          streamingMessageId: null,
          sheetOpen: false,
        } )
      }}
      onCreate={handleCreateThread}
      onRename={( thread ) => updateChatUi( { renameTargetId: thread.id } )}
      onDelete={( thread ) => updateChatUi( { deleteTargetId: thread.id } )}
    />
  )

  return (
    <>
      <SidebarInset className="chat-square">
        <ChatPageHeader
          isMobile={isMobile}
          sheetOpen={sheetOpen}
          onSheetOpenChange={( value ) => updateChatUi( { sheetOpen: value } )}
          threadPanelOpen={threadPanelOpen}
          onToggleThreadPanel={() =>
            updateChatUi( { threadPanelOpen: !threadPanelOpen } )
          }
          sidebarContent={sidebarContent}
        />

        <div className="flex h-[calc(100dvh-5em)] min-h-0">
          {!isMobile && threadPanelOpen ? (
            <aside className="hidden w-75 shrink-0 lg:block">
              {sidebarContent}
              <div
                ref={threadLoadRef}
                data-page={pageKey( threadPage )}
                className="h-3"
              />
            </aside>
          ) : null}

          <section className="flex min-w-0 flex-1 flex-col px-2 pb-2 sm:px-4 sm:pb-4">
            <ChatPageContent
              hasActiveThread={Boolean( activeThread )}
              messages={allMessages}
              activeMessageId={
                messageActions.regenerateMutation.variables ?? null
              }
              isMessagePending={messageActions.regenerateMutation.isPending}
              isStreaming={streamingMessageId !== null}
              composerValue={composerValue}
              isSending={messageActions.sendMutation.isPending}
              messageLoadRef={messageLoadRef}
              messagePageKey={pageKey( messagePage )}
              onRegenerate={( messageId ) =>
                messageActions.regenerateMutation.mutate( messageId )
              }
              onDelete={( messageId ) =>
                messageActions.deleteMessageMutation.mutate( messageId )
              }
              onComposerChange={( value ) =>
                updateChatUi( { composerValue: value } )
              }
              onComposerSubmit={messageActions.submitMessage}
              onComposerStop={messageActions.stopStreaming}
              onCreateThread={handleCreateThread}
            />
          </section>
        </div>
      </SidebarInset>

      <ChatThreadRenameDialog
        open={Boolean( renameTarget )}
        thread={renameTarget}
        isPending={threadActions.renameThreadMutation.isPending}
        onOpenChange={( open ) => {
          if ( !open ) updateChatUi( { renameTargetId: null } )
        }}
        onConfirm={( title ) => {
          if ( !renameTarget ) return
          threadActions.renameThreadMutation.mutate( {
            threadId: renameTarget.id,
            title,
          } )
        }}
      />

      <ChatThreadDeleteDialog
        open={Boolean( deleteTarget )}
        thread={deleteTarget}
        isPending={threadActions.deleteThreadMutation.isPending}
        onOpenChange={( open ) => {
          if ( !open ) updateChatUi( { deleteTargetId: null } )
        }}
        onConfirm={() => {
          if ( !deleteTarget ) return
          threadActions.deleteThreadMutation.mutate( deleteTarget.id )
        }}
      />
    </>
  )
}
