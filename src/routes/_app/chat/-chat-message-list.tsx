import { useMemo } from 'react'
import type { ChatMessageSnapshot } from './-chat-types'
import { ChatMessageItem } from './-chat-message-item'

type ChatMessageListProps = {
  messages: ChatMessageSnapshot[]
  activeMessageId: string | null
  isPending: boolean
  onRegenerate: (messageId: string) => void
  onDelete: (messageId: string) => void
}

export function ChatMessageList({
  messages,
  activeMessageId,
  isPending,
  onRegenerate,
  onDelete,
}: ChatMessageListProps) {
  const sorted = useMemo(
    () =>
      [...messages].sort((left, right) =>
        left.createdAt.localeCompare(right.createdAt),
      ),
    [messages],
  )

  return (
    <div className="space-y-3 pb-3 sm:space-y-4 sm:pb-4">
      {sorted.map((message) => (
        <ChatMessageItem
          key={message.id}
          message={message}
          isPending={isPending && activeMessageId === message.id}
          onRegenerate={onRegenerate}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
