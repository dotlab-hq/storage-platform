import { z } from 'zod'

const DEFAULT_MODEL = 'barrage-chat'

type OpenAiMessageContentPart = {
    type: string
    text?: string
}

type OpenAiMessageContent = string | OpenAiMessageContentPart[]

type OpenAiMessage = {
    role: 'system' | 'user' | 'assistant' | 'tool'
    content: OpenAiMessageContent
}

export type NormalizedChatStreamRequest = {
    threadId: string | null
    content: string
    model: string
    stream: boolean
}

const LegacyStreamMessageSchema = z.object( {
    threadId: z.string().min( 1 ).optional(),
    content: z.string().trim().min( 1 ).max( 6000 ),
} )

const OpenAiMessageSchema: z.ZodType<OpenAiMessage> = z.object( {
    role: z.enum( ['system', 'user', 'assistant', 'tool'] ),
    content: z.union( [
        z.string(),
        z
            .array(
                z
                    .object( {
                        type: z.string(),
                        text: z.string().optional(),
                    } )
                    .passthrough(),
            )
            .min( 1 ),
    ] ),
} )

const OpenAiChatCompletionsSchema = z
    .object( {
        model: z.string().trim().min( 1 ).optional(),
        stream: z.boolean().optional(),
        threadId: z.string().min( 1 ).optional(),
        thread_id: z.string().min( 1 ).optional(),
        messages: z.array( OpenAiMessageSchema ).min( 1 ),
    } )
    .passthrough()

function normalizeContent( content: OpenAiMessageContent ): string {
    if ( typeof content === 'string' ) {
        return content.trim()
    }

    return content
        .map( ( part ) => ( typeof part.text === 'string' ? part.text : '' ) )
        .join( ' ' )
        .trim()
}

function extractLatestUserContent( messages: OpenAiMessage[] ): string {
    for ( let index = messages.length - 1; index >= 0; index -= 1 ) {
        const message = messages[index]
        if ( message.role !== 'user' ) {
            continue
        }

        const normalized = normalizeContent( message.content )
        if ( normalized.length > 0 ) {
            return normalized
        }
    }

    throw new Error( 'A user message with text content is required.' )
}

export function normalizeChatStreamRequest(
    body: unknown,
): NormalizedChatStreamRequest {
    const legacy = LegacyStreamMessageSchema.safeParse( body )
    if ( legacy.success ) {
        return {
            threadId: legacy.data.threadId ?? null,
            content: legacy.data.content,
            model: DEFAULT_MODEL,
            stream: true,
        }
    }

    const openAi = OpenAiChatCompletionsSchema.parse( body )

    return {
        threadId: openAi.threadId ?? openAi.thread_id ?? null,
        content: extractLatestUserContent( openAi.messages ),
        model: openAi.model ?? DEFAULT_MODEL,
        stream: openAi.stream ?? true,
    }
}

export type OpenAiChunkDelta = {
    role?: 'assistant'
    content?: string
}

export function toOpenAiChunk( {
    id,
    created,
    model,
    delta,
    finishReason,
}: {
    id: string
    created: number
    model: string
    delta: OpenAiChunkDelta
    finishReason: 'stop' | null
} ) {
    return {
        id,
        object: 'chat.completion.chunk' as const,
        created,
        model,
        choices: [
            {
                index: 0,
                delta,
                finish_reason: finishReason,
            },
        ],
    }
}

export function toOpenAiCompletion( {
    id,
    created,
    model,
    content,
}: {
    id: string
    created: number
    model: string
    content: string
} ) {
    return {
        id,
        object: 'chat.completion' as const,
        created,
        model,
        choices: [
            {
                index: 0,
                message: {
                    role: 'assistant' as const,
                    content,
                },
                finish_reason: 'stop' as const,
            },
        ],
    }
}

export function toSseEvent( payload: unknown | '[DONE]' ): string {
    if ( payload === '[DONE]' ) {
        return 'data: [DONE]\n\n'
    }

    return `data: ${JSON.stringify( payload )}\n\n`
}
