import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import {
    Conversation,
    ConversationContent,
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
    isStreaming,
    composerValue,
    isSending,
    messageLoadRef,
    messagePageKey,
    onRegenerate,
    onDelete,
    onComposerChange,
    onComposerSubmit,
    onComposerStop,
    onCreateThread,
}: ChatPageContentProps ) {
    const viewportRef = useRef<HTMLDivElement>( null )
    const [isAtBottom, setIsAtBottom] = useState( true )

    // Auto-scroll to bottom when new messages arrive
    useEffect( () => {
        if ( !viewportRef.current ) return

        // Always scroll to bottom when messages change or streaming
        if ( isAtBottom || isStreaming || isSending ) {
            const scrollTimeout = setTimeout( () => {
                if ( viewportRef.current ) {
                    viewportRef.current.scrollTop = viewportRef.current.scrollHeight
                }
            }, 50 )

            return () => clearTimeout( scrollTimeout )
        }
    }, [messages, isAtBottom, isStreaming, isSending] )

    // Track scroll position
    const handleScroll = ( event: React.UIEvent<HTMLDivElement> ) => {
        const target = event.currentTarget
        const scrollPercentage =
            ( target.scrollHeight - target.scrollTop - target.clientHeight ) /
            Math.max( target.scrollHeight - target.clientHeight, 1 )

        // Show arrow if scrolled up more than 10% of scroll area
        setIsAtBottom( scrollPercentage < 0.15 )
    }

    const scrollToBottom = () => {
        if ( viewportRef.current ) {
            viewportRef.current.scrollTop = viewportRef.current.scrollHeight
            setIsAtBottom( true )
        }
    }

    return (
        <>
            <div className="relative flex-1 min-h-0 overflow-hidden">
                <div
                    ref={viewportRef}
                    className="h-full overflow-y-auto"
                    onScroll={handleScroll}
                >
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
                                        messageLoadRef={messageLoadRef}
                                    />
                                </Suspense>
                                <div
                                    className="h-3"
                                />
                            </ConversationContent>
                        </Conversation>
                    ) : (
                        <ChatEmptyState onStart={onCreateThread} />
                    )}
                </div>

                {!isAtBottom && (
                    <Button
                        onClick={scrollToBottom}
                        className="absolute bottom-4 right-4 rounded-full shadow-lg"
                        size="icon"
                        variant="outline"
                    >
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <Suspense fallback={<PageSkeleton className="h-28" variant="compact" />}>
                <ChatPageComposer
                    value={composerValue}
                    isSending={isSending}
                    isStreaming={isStreaming}
                    onChange={onComposerChange}
                    onSubmit={onComposerSubmit}
                    onStop={onComposerStop}
                />
            </Suspense>
        </>
    )
}
