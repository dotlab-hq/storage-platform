import { ClientOnly, createClientOnlyFn } from '@tanstack/react-start'
import { Copy, RefreshCw, Trash2, UserRound } from 'lucide-react'
import { Suspense, lazy } from 'react'
import { cn } from '@/lib/utils'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import {
  ChatMessageActionButton,
  ChatMessageActions,
  ChatMessageContent,
  ChatMessageShell,
} from './-chat-message-shell'
import type { ChatMessageSnapshot } from './-chat-types'

type ChatMessageResponseComponent = (props: {
  content: string
  className?: string
  isStreaming?: boolean
}) => JSX.Element

const loadChatMessageResponse = createClientOnlyFn(
  async (): Promise<ChatMessageResponseComponent> => {
    const module = await import('./-chat-message-response')
    return module.ChatMessageResponse
  },
)

const ChatMessageResponseLazy = lazy(() =>
  loadChatMessageResponse().then((component) => ({
    default: component,
  })),
)

type ChatMessageItemProps = {
  message: ChatMessageSnapshot
  isPending: boolean
  isStreaming: boolean
  onRegenerate: (messageId: string) => void
  onDelete: (messageId: string) => void
}

export function ChatMessageItem({
  message,
  isPending,
  isStreaming,
  onRegenerate,
  onDelete,
}: ChatMessageItemProps) {
  const isUser = message.role === 'user'

  return (
    <ChatMessageShell
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

        <ChatMessageActions className="gap-1 opacity-80 group-hover:opacity-100">
          <ChatMessageActionButton
            className="h-7 w-7"
            onClick={() => void navigator.clipboard.writeText(message.content)}
            aria-label="Copy message"
            tooltip="Copy message"
            label="Copy message"
          >
            <Copy className="h-3.5 w-3.5" />
          </ChatMessageActionButton>
          {!isUser ? (
            <ChatMessageActionButton
              className="h-7 w-7"
              onClick={() => onRegenerate(message.id)}
              disabled={isPending}
              aria-label="Regenerate response"
              tooltip="Regenerate response"
              label="Regenerate response"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </ChatMessageActionButton>
          ) : null}
          <ChatMessageActionButton
            className="h-7 w-7"
            onClick={() => onDelete(message.id)}
            disabled={isPending}
            aria-label="Delete message"
            tooltip="Delete message"
            label="Delete message"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </ChatMessageActionButton>
        </ChatMessageActions>
      </header>

      <ChatMessageContent
        className={cn(
          'w-full max-w-full text-sm leading-6 sm:text-[15px]',
          'group-[.is-user]:bg-transparent group-[.is-user]:px-0 group-[.is-user]:py-0',
        )}
      >
        <ClientOnly
          fallback={<PageSkeleton variant="compact" className="h-5 w-32" />}
        >
          <Suspense fallback={<PageSkeleton variant="chat" className="h-16" />}>
            <ChatMessageResponseLazy
              content={message.content}
              isStreaming={!isUser && isStreaming}
            />
          </Suspense>
        </ClientOnly>
      </ChatMessageContent>
    </ChatMessageShell>
  )
}
