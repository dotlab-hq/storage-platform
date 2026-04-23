'use client'

import { PromptInputBox } from '@/components/ui/ai-prompt-box'

type ChatPageComposerProps = {
  value: string
  isSending: boolean
  isStreaming?: boolean
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  onStop?: () => void
}

export function ChatPageComposer({
  value,
  isSending,
  isStreaming,
  onChange,
  onSubmit,
  onStop,
}: ChatPageComposerProps) {
  const isLoading = isSending || isStreaming

  const handleSend = (message: string, _files?: File[]) => {
    // For now, only handle text; file attachments can be integrated later
    onSubmit(message)
  }

  return (
    <div className="sticky bottom-0 mt-2 bg-background/90 p-2 shadow-lg backdrop-blur sm:p-3 w-full">
      <PromptInputBox
        onSend={handleSend}
        onStop={onStop}
        isLoading={isLoading}
        value={value}
        onValueChange={onChange}
        placeholder="Type your message..."
        className="w-full"
      />
    </div>
  )
}
