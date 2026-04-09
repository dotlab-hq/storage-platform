import { useEffect } from 'react'

type ChatPageEventsParams = {
  composerValue: string
  onCreateThread: () => void
  onSendMessage: (value: string) => void
}

export function useChatPageEvents({
  composerValue,
  onCreateThread,
  onSendMessage,
}: ChatPageEventsParams) {
  useEffect(() => {
    const onCreate = () => onCreateThread()
    const onSend = () => onSendMessage(composerValue)
    window.addEventListener('dot:chat-new-thread', onCreate)
    window.addEventListener('dot:chat-send-message', onSend)
    return () => {
      window.removeEventListener('dot:chat-new-thread', onCreate)
      window.removeEventListener('dot:chat-send-message', onSend)
    }
  }, [composerValue, onCreateThread, onSendMessage])
}
