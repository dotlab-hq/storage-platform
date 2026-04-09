import { ChatEmptyState } from './-chat-empty-state'
import { ChatMessageList } from './-chat-message-list'
import { ChatPageComposer } from './-chat-page-composer'
import type { ChatMessageSnapshot } from './-chat-types'

type ChatPageContentProps = {
  hasActiveThread: boolean
  messages: ChatMessageSnapshot[]
  activeMessageId: string | null
  isMessagePending: boolean
  composerValue: string
  isSending: boolean
  messageLoadRef: React.RefObject<HTMLDivElement | null>
  messagePageKey: string
  onRegenerate: (messageId: string) => void
  onDelete: (messageId: string) => void
  onComposerChange: (value: string) => void
  onComposerSubmit: () => void
  onCreateThread: () => void
}

export function ChatPageContent({
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
}: ChatPageContentProps) {
  if (!hasActiveThread) {
    return <ChatEmptyState onStart={onCreateThread} />
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto pt-3 sm:pt-4">
        <ChatMessageList
          messages={messages}
          activeMessageId={activeMessageId}
          isPending={isMessagePending}
          onRegenerate={onRegenerate}
          onDelete={onDelete}
        />
        <div ref={messageLoadRef} data-page={messagePageKey} className="h-3" />
      </div>

      <ChatPageComposer
        value={composerValue}
        isSending={isSending}
        onChange={onComposerChange}
        onSubmit={onComposerSubmit}
      />
    </>
  )
}
