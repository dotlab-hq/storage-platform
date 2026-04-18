import { Search, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ChatThreadSnapshot } from './-chat-types'
import { ChatThreadItem } from './-chat-thread-item'

type ChatThreadSidebarContentProps = {
  threads: ChatThreadSnapshot[]
  activeThreadId: string | null
  query: string
  onQueryChange: ( value: string ) => void
  onSelect: ( threadId: string ) => void
  onCreate: () => void
  onRename: ( thread: ChatThreadSnapshot ) => void
  onDelete: ( thread: ChatThreadSnapshot ) => void
}

export function ChatThreadSidebarContent( {
  threads,
  activeThreadId,
  query,
  onQueryChange,
  onSelect,
  onCreate,
  onRename,
  onDelete,
}: ChatThreadSidebarContentProps ) {
  return (
    <div className="flex h-full flex-col">
      <div className="sticky top-0 z-10 bg-background/95 px-2 py-2 backdrop-blur">
        <Button className="w-full justify-start" onClick={onCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Thread
        </Button>
        <div className="relative mt-2">
          <Search className="text-muted-foreground pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={( event ) => onQueryChange( event.target.value )}
            placeholder="Search threads"
            className="pl-8"
          />
        </div>
      </div>

      <div className="hide-scrollbar flex-1 space-y-1 overflow-y-auto px-1 py-2">
        {threads.length === 0 ? (
          <p className="text-muted-foreground px-2 py-6 text-center text-sm">
            No matching chats.
          </p>
        ) : (
          threads.map( ( thread ) => (
            <ChatThreadItem
              key={thread.id}
              thread={thread}
              isActive={activeThreadId === thread.id}
              onSelect={onSelect}
              onRename={onRename}
              onDelete={onDelete}
            />
          ) )
        )}
      </div>
    </div>
  )
}
