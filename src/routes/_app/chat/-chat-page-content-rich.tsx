import { Suspense, lazy } from 'react'
import {
    Conversation,
    ConversationContent,
    ConversationScrollButton,
} from '@/components/ai-elements/conversation'
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
}: ChatPageContentProps ) {
    return (
        <>
            <div className="flex-1 min-h-0 pt-3 sm:pt-4 overflow-y-auto">
                <Conversation>
                    <ConversationContent className="gap-3 p-3 sm:gap-4 sm:p-4">
                        <Suspense fallback={null}>
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
            </div>

            <Suspense fallback={null}>
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
