import { Copy, RefreshCw, Trash2, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ChatMessageSnapshot } from './-chat-types'

type ChatMessageItemProps = {
  message: ChatMessageSnapshot
  isPending: boolean
  onRegenerate: (messageId: string) => void
  onDelete: (messageId: string) => void
}

export function ChatMessageItem({
  message,
  isPending,
  onRegenerate,
  onDelete,
}: ChatMessageItemProps) {
  const isUser = message.role === 'user'

  return (
    <article
      className={cn(
        'group max-w-[100%] rounded-2xl border p-3 shadow-sm sm:p-4',
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
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px]">
              v{message.regenerationCount + 1}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => void navigator.clipboard.writeText(message.content)}
            aria-label="Copy message"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          {!isUser ? (
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => onRegenerate(message.id)}
              disabled={isPending}
              aria-label="Regenerate response"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          ) : null}
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => onDelete(message.id)}
            disabled={isPending}
            aria-label="Delete message"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </header>
      <p className="whitespace-pre-wrap break-words text-sm leading-6 sm:text-[15px]">
        {message.content}
      </p>
    </article>
  )
}
