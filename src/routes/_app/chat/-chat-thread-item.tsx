import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { ChatThreadSnapshot } from './-chat-types'

type ChatThreadItemProps = {
  thread: ChatThreadSnapshot
  isActive: boolean
  onSelect: (threadId: string) => void
  onRename: (thread: ChatThreadSnapshot) => void
  onDelete: (thread: ChatThreadSnapshot) => void
}

function formatTimeLabel(value: string): string {
  const parsed = new Date(value)
  const delta = Date.now() - parsed.getTime()
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour
  if (delta < minute) return 'now'
  if (delta < hour) return `${Math.max(1, Math.floor(delta / minute))}m`
  if (delta < day) return `${Math.max(1, Math.floor(delta / hour))}h`
  return `${Math.max(1, Math.floor(delta / day))}d`
}

export function ChatThreadItem({
  thread,
  isActive,
  onSelect,
  onRename,
  onDelete,
}: ChatThreadItemProps) {
  return (
    <div
      className={cn(
        'group rounded-lg border px-2 py-1.5 transition-colors',
        'focus-within:ring-2 focus-within:ring-primary/45',
        isActive
          ? 'border-primary/40 bg-primary/10'
          : 'border-transparent hover:bg-accent/55',
      )}
    >
      <div className="flex items-start gap-1">
        <button
          type="button"
          onClick={() => onSelect(thread.id)}
          className="min-w-0 flex-1 rounded-sm px-1 py-0.5 text-left"
        >
          <p className="truncate text-sm font-medium">{thread.title}</p>
          <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
            {thread.latestPreview ?? 'No messages yet'}
          </p>
          <p className="text-muted-foreground mt-1 text-[11px]">
            {formatTimeLabel(thread.lastMessageAt)}
          </p>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 opacity-70 group-hover:opacity-100"
              aria-label={`Actions for ${thread.title}`}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onRename(thread)}>
              <Pencil className="mr-2 h-4 w-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() => onDelete(thread)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
