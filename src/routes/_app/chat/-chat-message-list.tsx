import { useMemo } from 'react'
import type { ChatMessageSnapshot } from './-chat-types'
import { ChatMessageItem } from './-chat-message-item'

type ChatMessageListProps = {
  messages: ChatMessageSnapshot[]
  activeMessageId: string | null
  isPending: boolean
  onRegenerate: ( messageId: string ) => void
  onDelete: ( messageId: string ) => void
  messageLoadRef?: React.RefObject<HTMLDivElement | null>
}

export function ChatMessageList( {
  messages,
  activeMessageId,
  isPending,
  onRegenerate,
  onDelete,
  messageLoadRef,
}: ChatMessageListProps ) {
  const sorted = useMemo(
    () =>
      [...messages].sort( ( left, right ) =>
        left.createdAt.localeCompare( right.createdAt ),
      ),
    [messages],
  )

  return (
    <div className="space-y-3 pb-3 sm:space-y-4 sm:pb-4">
      {/* Observer at top to load older messages */}
      {messageLoadRef && (
        <div
          ref={messageLoadRef}
          className="h-1"
          data-observer="top"
        />
      )}

      {sorted.map( ( message ) => (
        <ChatMessageItem
          key={message.id}
          message={message}
          isPending={isPending && activeMessageId === message.id}
          onRegenerate={onRegenerate}
          onDelete={onDelete}
        />
      ) )}
    </div>
  )
}
