import { useEffect } from 'react'
import { updateChatUi, useChatUiStore } from './-chat-store'

type ChatStoreSyncParams = {
  initialThreadId: string | null
}

export function useChatStoreSync({ initialThreadId }: ChatStoreSyncParams) {
  const activeThreadId = useChatUiStore((state) => state.activeThreadId)

  useEffect(() => {
    if (!activeThreadId && initialThreadId) {
      updateChatUi({ activeThreadId: initialThreadId })
    }
  }, [activeThreadId, initialThreadId])
}
