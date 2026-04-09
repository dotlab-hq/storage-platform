import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

type ChatPageComposerProps = {
  value: string
  isSending: boolean
  onChange: (value: string) => void
  onSubmit: () => void
}

export function ChatPageComposer({
  value,
  isSending,
  onChange,
  onSubmit,
}: ChatPageComposerProps) {
  return (
    <div className="sticky bottom-0 mt-2 rounded-xl border bg-background/90 p-2 shadow-lg backdrop-blur sm:p-3">
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Type your message..."
        className="min-h-20 resize-none"
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            onSubmit()
          }
        }}
      />
      <div className="mt-2 flex items-center justify-between">
        <p className="text-muted-foreground text-xs">
          Enter to send, Shift+Enter for newline
        </p>
        <Button
          onClick={onSubmit}
          disabled={isSending || value.trim().length === 0}
        >
          <Send className="mr-2 h-4 w-4" />
          Send
        </Button>
      </div>
    </div>
  )
}
