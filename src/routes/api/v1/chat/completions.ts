import { json } from '@tanstack/react-start'
import { createFileRoute } from '@tanstack/react-router'
import { getAuthenticatedUser } from '@/lib/server-auth'
import { db } from '@/db'
import { chatMessage, chatThread } from '@/db/schema/chat'
import { and, eq } from 'drizzle-orm'
import { openAIMessagesToLangChain } from '@/routes/_app/chat/-converters'
import { getToolsByName } from '@/routes/_app/chat/tools/-tool-registry'
import { OpenAIChatCompletionsSchema } from '../-schemas'
import type { LLMStreamParams } from '@/routes/_app/chat/-chat-llm-streamer'
import { handleStreamingResponse } from './-streaming-handler'
import { handleNonStreamingResponse } from './-non-streaming-handler'
import { getUserFromApiKey } from './-auth-helpers'

// @ts-expect-error - route type will be generated after router rebuild
export const Route = createFileRoute('/api/v1/chat/completions')({
  server: {
    handlers: {
      POST: POST,
      OPTIONS: OPTIONS,
    },
  },
})

export async function OPTIONS() {
  return json(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
    status: 204,
  })
}

export async function POST({ request }: { request: Request }) {
  try {
    const body = await request.json()
    const validated = OpenAIChatCompletionsSchema.parse(body)

    // Authentication (session OR API key)
    let currentUser = await getAuthenticatedUser().catch(() => null)
    let apiKeyUser = await getUserFromApiKey(request.headers).catch(() => null)

    if (!currentUser && !apiKeyUser) {
      return json(
        {
          error: {
            message: 'Unauthorized - provide valid session or API key',
            type: 'authentication_error',
            code: 'missing_auth',
          },
        },
        { status: 401 },
      )
    }

    const user = currentUser ?? apiKeyUser!

    // Determine threadId
    let threadId: string
    const inputThreadId = validated.thread_id || validated.threadId
    if (inputThreadId) {
      const existing = await db
        .select({ id: chatThread.id })
        .from(chatThread)
        .where(
          and(
            eq(chatThread.id, inputThreadId),
            eq(chatThread.userId, user.id),
            eq(chatThread.isDeleted, false),
          ),
        )
        .limit(1)

      if (existing.length === 0) {
        return json(
          {
            error: {
              message: 'Thread not found.',
              type: 'invalid_request_error',
              code: 'thread_not_found',
            },
          },
          { status: 404 },
        )
      }
      threadId = inputThreadId
    } else {
      const now = new Date()
      const [newThread] = await db
        .insert(chatThread)
        .values({
          userId: user.id,
          title: 'New Chat',
          latestPreview: null,
          lastMessageAt: now,
          isDeleted: false,
          createdAt: now,
          updatedAt: now,
        })
        .returning({ id: chatThread.id })
      threadId = newThread.id
    }

    // Convert messages to LangChain format
    const langchainMessages = openAIMessagesToLangChain(validated.messages)

    // Insert user message
    const userMessageContent =
      validated.messages[validated.messages.length - 1].content
    const now = new Date()
    const [userMessage] = await db
      .insert(chatMessage)
      .values({
        threadId,
        userId: user.id,
        role: 'user',
        content:
          typeof userMessageContent === 'string'
            ? userMessageContent
            : JSON.stringify(userMessageContent),
        regenerationCount: 0,
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
      })
      .returning({ id: chatMessage.id })

    // Determine tools
    const availableTools = getToolsByName(
      validated.tools?.map((t) => t.function.name) || [],
    )

    // Prepare LLM parameters
    const llmParams: LLMStreamParams = {
      temperature: validated.temperature,
      topP: validated.top_p,
      maxOutputTokens: validated.max_tokens,
      stopSequences: validated.stop as string[] | undefined,
      seed: validated.seed,
      tools: availableTools,
      toolChoice: validated.tool_choice as any,
      responseFormat: validated.response_format,
      streamDelayMs: 0,
    }

    // Route to appropriate handler
    if (validated.stream) {
      return handleStreamingResponse({
        messages: langchainMessages,
        params: llmParams,
        threadId,
        userId: user.id,
        userMessageId: userMessage.id,
        model: validated.model,
      })
    } else {
      return handleNonStreamingResponse({
        messages: langchainMessages,
        params: llmParams,
        threadId,
        userId: user.id,
        userMessageId: userMessage.id,
        model: validated.model,
      })
    }
  } catch (error) {
    console.error('[OpenAI Chat] Request error:', error)
    return json(
      {
        error: {
          message:
            error instanceof Error ? error.message : 'Internal server error',
          type: 'invalid_request_error',
          code: 'server_error',
        },
      },
      { status: 500 },
    )
  }
}
