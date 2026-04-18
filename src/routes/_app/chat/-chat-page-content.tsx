import { useEffect, useState } from 'react'
import { createClientOnlyFn } from '@tanstack/react-start'
import { ChatEmptyState } from './-chat-empty-state'
import type { ChatMessageSnapshot } from './-chat-types'

export type ChatPageContentProps = {
  hasActiveThread: boolean
  messages: ChatMessageSnapshot[]
  activeMessageId: string | null
  isMessagePending: boolean
  composerValue: string
  isSending: boolean
  messageLoadRef: React.RefObject<HTMLDivElement | null>
  messagePageKey: string
  onRegenerate: ( messageId: string ) => void
  onDelete: ( messageId: string ) => void
  onComposerChange: ( value: string ) => void
  onComposerSubmit: ( value: string ) => void
  onCreateThread: () => void
}

type ChatPageContentRichModule = {
  ChatPageContentRich: ( props: ChatPageContentProps ) => JSX.Element
}

const loadChatPageContentRich = createClientOnlyFn( async () => {
  const module =
    await import( './-chat-page-content-rich' ) as ChatPageContentRichModule
  return module.ChatPageContentRich
} )

export function ChatPageContent( {
  hasActiveThread,
  messages,
  activeMessageId,
  isMessagePending,
  composerValue,
  isSending,
  messageLoadRef,
  messagePageKey,
  onRegenerate,
  onDelete,
  onComposerChange,
  onComposerSubmit,
  onCreateThread,
}: ChatPageContentProps ) {
  const [RichContent, setRichContent] = useState<
    ( ( props: ChatPageContentProps ) => JSX.Element ) | null
  >( null )

  useEffect( () => {
    let isMounted = true

    void loadChatPageContentRich().then( ( component ) => {
      if ( !isMounted ) {
        return
      }
      setRichContent( () => component )
    } )

    return () => {
      isMounted = false
    }
  }, [] )

  if ( !hasActiveThread ) {
    return <ChatEmptyState onStart={onCreateThread} />
  }

  if ( !RichContent ) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center pt-3 sm:pt-4">
        <p className="text-muted-foreground text-sm">Loading chat...</p>
      </div>
    )
  }

  return (
    <RichContent
      hasActiveThread={hasActiveThread}
      messages={messages}
      activeMessageId={activeMessageId}
      isMessagePending={isMessagePending}
      composerValue={composerValue}
      isSending={isSending}
      messageLoadRef={messageLoadRef}
      messagePageKey={messagePageKey}
      onRegenerate={onRegenerate}
      onDelete={onDelete}
      onComposerChange={onComposerChange}
      onComposerSubmit={onComposerSubmit}
      onCreateThread={onCreateThread}
    />
  )
}
