import { Suspense, lazy } from 'react'
import { ChatContentSkeleton } from './-chat-loading-skeletons'
import type { ChatMessageSnapshot } from './-chat-types'

export type ChatPageContentProps = {
  hasActiveThread: boolean
  messages: ChatMessageSnapshot[]
  activeMessageId: string | null
  isMessagePending: boolean
  isStreaming?: boolean
  composerValue: string
  isSending: boolean
  messageLoadRef: React.RefObject<HTMLDivElement | null>
  messagePageKey: string
  onRegenerate: (messageId: string) => void
  onDelete: (messageId: string) => void
  onComposerChange: (value: string) => void
  onComposerSubmit: (value: string) => void
  onComposerStop?: () => void
  onCreateThread: () => void
}

const ChatPageContentRich = lazy(() =>
  import('./-chat-page-content-rich').then(
    (module) => module.ChatPageContentRich,
  ),
)

export function ChatPageContent({
  hasActiveThread,
  messages,
  activeMessageId,
  isMessagePending,
  isStreaming,
  composerValue,
  isSending,
  messageLoadRef,
  messagePageKey,
  onRegenerate,
  onDelete,
  onComposerChange,
  onComposerSubmit,
  onComposerStop,
  onCreateThread,
}: ChatPageContentProps) {
  return (
    <Suspense fallback={<ChatContentSkeleton />}>
      <ChatPageContentRich
        hasActiveThread={hasActiveThread}
        messages={messages}
        activeMessageId={activeMessageId}
        isMessagePending={isMessagePending}
        isStreaming={isStreaming}
        composerValue={composerValue}
        isSending={isSending}
        messageLoadRef={messageLoadRef}
        messagePageKey={messagePageKey}
        onRegenerate={onRegenerate}
        onDelete={onDelete}
        onComposerChange={onComposerChange}
        onComposerSubmit={onComposerSubmit}
        onComposerStop={onComposerStop}
        onCreateThread={onCreateThread}
      />
    </Suspense>
  )
}
