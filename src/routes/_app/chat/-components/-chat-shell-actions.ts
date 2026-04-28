import { useMemo } from 'react'
import { useShellView } from '@/components/shell/shell-actions-registry'

type UseChatShellActionsParams = {
  hasActiveThread: boolean
}

export function useChatShellActions({
  hasActiveThread,
}: UseChatShellActionsParams) {
  const config = useMemo(
    () => ({
      commandActions: [
        {
          id: 'chat-new-thread',
          label: 'New Thread',
          onSelect: () =>
            window.dispatchEvent(new Event('dot:chat-new-thread')),
        },
      ],
      contextActions: [
        {
          id: 'chat-context-new-thread',
          label: 'New Thread',
          onSelect: () =>
            window.dispatchEvent(new Event('dot:chat-new-thread')),
        },
        {
          id: 'chat-context-send',
          label: hasActiveThread ? 'Send Message' : 'Create Thread',
          onSelect: () =>
            window.dispatchEvent(new Event('dot:chat-send-message')),
        },
      ],
    }),
    [hasActiveThread],
  )

  useShellView('chat', config)
}
