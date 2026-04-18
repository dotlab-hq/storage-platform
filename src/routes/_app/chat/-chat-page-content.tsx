import { Suspense, lazy } from 'react'
import { ChatContentSkeleton } from './-chat-loading-skeletons'
import type { ChatMessageSnapshot } from './-chat-types'

export type ChatPageContentProps = {
  hasActiveThread: boolean
  messages: ChatMessageSnapshot[]
  activeMessageId: string | null
  isMessagePending: boolean
  composerValue: string
  isSending: boolean
  messageLoadRef: React.RefObject<HTMLDivElement | null>
  messagePageKey: string
  onRegenerate: ( messageId: string ) => void
  onDelete: ( messageId: string ) => void
  onComposerChange: ( value: string ) => void
  onComposerSubmit: ( value: string ) => void
  onCreateThread: () => void
}

const ChatPageContentRich = lazy( () =>
  import( './-chat-page-content-rich' ).then( ( module ) => ( {
    default: module.ChatPageContentRich,
  } ) ),
)

export function ChatPageContent( {
  hasActiveThread,
  messages,
  activeMessageId,
  isMessagePending,
  composerValue,
  isSending,
  messageLoadRef,
  messagePageKey,
  onRegenerate,
  onDelete,
  onComposerChange,
  onComposerSubmit,
  onCreateThread,
}: ChatPageContentProps ) {
  return (
    <Suspense fallback={<ChatContentSkeleton />}>
      <ChatPageContentRich
        hasActiveThread={hasActiveThread}
        messages={messages}
        activeMessageId={activeMessageId}
        isMessagePending={isMessagePending}
        composerValue={composerValue}
        isSending={isSending}
        messageLoadRef={messageLoadRef}
        messagePageKey={messagePageKey}
        onRegenerate={onRegenerate}
        onDelete={onDelete}
        onComposerChange={onComposerChange}
        onComposerSubmit={onComposerSubmit}
        onCreateThread={onCreateThread}
      />
    </Suspense>
  )
}
