import { Suspense, lazy } from 'react'
import {
    Conversation,
    ConversationContent,
    ConversationScrollButton,
} from '@/components/ai-elements/conversation'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import { ChatEmptyState } from './-chat-empty-state'
import type { ChatPageContentProps } from './-chat-page-content'

const ChatMessageList = lazy( () =>
    import( './-chat-message-list' ).then( ( module ) => ( {
        default: module.ChatMessageList,
    } ) ),
)

const ChatPageComposer = lazy( () =>
    import( './-chat-page-composer' ).then( ( module ) => ( {
        default: module.ChatPageComposer,
    } ) ),
)

export function ChatPageContentRich( {
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
    return (
        <>
            <div className="flex-1 min-h-0 pt-3 sm:pt-4 overflow-y-auto">
                {hasActiveThread ? (
                    <Conversation>
                        <ConversationContent className="gap-3 p-3 sm:gap-4 sm:p-4">
                            <Suspense fallback={<PageSkeleton variant="chat" className="mb-3" />}>
                                <ChatMessageList
                                    messages={messages}
                                    activeMessageId={activeMessageId}
                                    isPending={isMessagePending}
                                    onRegenerate={onRegenerate}
                                    onDelete={onDelete}
                                />
                            </Suspense>
                            <div
                                ref={messageLoadRef}
                                data-page={messagePageKey}
                                className="h-3"
                            />
                        </ConversationContent>
                        <ConversationScrollButton className="rounded-full" />
                    </Conversation>
                ) : (
                    <ChatEmptyState onStart={onCreateThread} />
                )}
            </div>

            <Suspense fallback={<PageSkeleton className="h-28" variant="compact" />}>
                <ChatPageComposer
                    value={composerValue}
                    isSending={isSending}
                    onChange={onComposerChange}
                    onSubmit={onComposerSubmit}
                />
            </Suspense>
        </>
    )
}
