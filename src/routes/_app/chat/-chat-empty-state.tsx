import { MessageSquareDashed } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ChatEmptyStateProps = {
  onStart: () => void
}

export function ChatEmptyState({ onStart }: ChatEmptyStateProps) {
  return (
    <div className="flex h-full min-h-[380px] flex-col items-center justify-center rounded-2xl border border-dashed bg-card/45 px-6 text-center">
      <div className="bg-primary/12 text-primary mb-3 flex h-12 w-12 items-center justify-center rounded-full">
        <MessageSquareDashed className="h-6 w-6" />
      </div>
      <h2 className="text-lg font-semibold">Start a barrage chat</h2>
      <p className="text-muted-foreground mt-2 max-w-md text-sm">
        Threads stay in your sub-sidebar. Send a prompt to create a chat and use
        regenerate, rename, or delete actions as you iterate.
      </p>
      <Button className="mt-4" onClick={onStart}>
        New Thread
      </Button>
    </div>
  )
}
