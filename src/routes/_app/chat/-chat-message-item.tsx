import { Copy, RefreshCw, Trash2, UserRound } from 'lucide-react'
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message'
import { cn } from '@/lib/utils'
import type { ChatMessageSnapshot } from './-chat-types'

type ChatMessageItemProps = {
  message: ChatMessageSnapshot
  isPending: boolean
  onRegenerate: ( messageId: string ) => void
  onDelete: ( messageId: string ) => void
}

export function ChatMessageItem( {
  message,
  isPending,
  onRegenerate,
  onDelete,
}: ChatMessageItemProps ) {
  const isUser = message.role === 'user'

  return (
    <Message
      from={isUser ? 'user' : 'assistant'}
      className={cn(
        'group max-w-full rounded-md p-3 shadow-sm sm:p-4',
        isUser
          ? 'ml-auto w-full bg-primary text-primary-foreground sm:max-w-[80%]'
          : 'mr-auto w-full bg-card sm:max-w-[86%]',
      )}
    >
      <header className="mb-2 flex items-center justify-between gap-2 text-xs opacity-85">
        <div className="flex items-center gap-1.5">
          {isUser ? <UserRound className="h-3.5 w-3.5" /> : null}
          <span>{isUser ? 'You' : 'Assistant'}</span>
          {!isUser && message.regenerationCount > 0 ? (
            <span className="bg-muted px-2 py-0.5 text-[11px]">
              v{message.regenerationCount + 1}
            </span>
          ) : null}
        </div>

        <MessageActions className="gap-1 opacity-80 group-hover:opacity-100">
          <MessageAction
            className="h-7 w-7"
            onClick={() => void navigator.clipboard.writeText( message.content )}
            aria-label="Copy message"
            tooltip="Copy message"
            label="Copy message"
          >
            <Copy className="h-3.5 w-3.5" />
          </MessageAction>
          {!isUser ? (
            <MessageAction
              className="h-7 w-7"
              onClick={() => onRegenerate( message.id )}
              disabled={isPending}
              aria-label="Regenerate response"
              tooltip="Regenerate response"
              label="Regenerate response"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </MessageAction>
          ) : null}
          <MessageAction
            className="h-7 w-7"
            onClick={() => onDelete( message.id )}
            disabled={isPending}
            aria-label="Delete message"
            tooltip="Delete message"
            label="Delete message"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </MessageAction>
        </MessageActions>
      </header>

      <MessageContent
        className={cn(
          'w-full max-w-full text-sm leading-6 sm:text-[15px]',
          'group-[.is-user]:bg-transparent group-[.is-user]:px-0 group-[.is-user]:py-0',
        )}
      >
        <MessageResponse>{message.content}</MessageResponse>
      </MessageContent>
    </Message>
  )
}
