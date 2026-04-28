import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { db } from '@/db'
import { chatThread, chatMessage } from '@/db/schema/chat'
import { and, asc, eq } from 'drizzle-orm'
import { getAuthenticatedUser } from '@/lib/server-auth.server'
import { handleOrchestratedAgentStream } from '@/routes/api/v1/chat/-orchestrated-stream-handler'
import type { LLMStreamParams } from '@/routes/_app/chat/-chat-llm-streamer'
import { getAllTools } from '@/routes/_app/chat/tools/-tool-registry'
import type { BaseMessage } from '@langchain/core/messages'
import {
  SystemMessage,
  HumanMessage,
  AIMessage,
  ToolMessage,
} from '@langchain/core/messages'
import type { OpenAiToolCall } from '@/routes/api/v1/-schemas'

const SYSTEM_PROMPT =
  'You are Barrage Chat, a practical engineering assistant. Answer clearly and directly in markdown. When useful, include short bullet points and concise code blocks. Be concise and helpful. You have access to math tools (add, subtract, multiply, divide) to help with calculations. Use them when appropriate.'

export const Route = createFileRoute('/api/chat/stream')({
  server: {
    handlers: {
      POST,
      OPTIONS,
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
    // Get authenticated user
    const user = await getAuthenticatedUser()
    if (!user) {
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

    // Parse request body
    const body: Record<string, unknown> = await request.json()
    const content = body.content as string | undefined
    const inputThreadId = body.threadId as string | undefined

    if (!content || typeof content !== 'string') {
      return json(
        {
          error: {
            message: 'Content is required',
            type: 'invalid_request_error',
            code: 'missing_content',
          },
        },
        { status: 400 },
      )
    }

    // Resolve or create thread
    let threadId: string
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

    // Load prior messages from DB (excluding deleted)
    const priorRows = await db
      .select({
        id: chatMessage.id,
        role: chatMessage.role,
        content: chatMessage.content,
        toolCalls: chatMessage.toolCalls,
        toolCallId: chatMessage.toolCallId,
        createdAt: chatMessage.createdAt,
      })
      .from(chatMessage)
      .where(
        and(
          eq(chatMessage.threadId, threadId),
          eq(chatMessage.isDeleted, false),
        ),
      )
      .orderBy(asc(chatMessage.createdAt))

    // Convert DB messages to LangChain BaseMessage[]
    const messages: BaseMessage[] = [new SystemMessage(SYSTEM_PROMPT)]
    for (const row of priorRows) {
      if (row.role === 'user') {
        messages.push(new HumanMessage(row.content))
      } else if (row.role === 'assistant') {
        const aiMsg = new AIMessage(row.content)
        if (row.toolCalls) {
          try {
            const parsed = JSON.parse(row.toolCalls) as OpenAiToolCall[]
            aiMsg.tool_calls = parsed.map((tc) => ({
              id: tc.id,
              name: tc.function.name,
              args: JSON.parse(tc.function.arguments),
              type: 'tool_call' as const,
            }))
          } catch {
            // ignore parse errors
          }
        }
        messages.push(aiMsg)
      } else if (row.role === 'tool') {
        messages.push(new ToolMessage(row.content, row.toolCallId ?? ''))
      }
    }

    // Insert the new user message
    const trimmedContent = content.trim()
    const [userMessage] = await db
      .insert(chatMessage)
      .values({
        threadId,
        userId: user.id,
        role: 'user',
        content: trimmedContent,
        toolCalls: null,
        regenerationCount: 0,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({ id: chatMessage.id })
    const userMessageId = userMessage.id

    // Append new user message to the conversation
    messages.push(new HumanMessage(trimmedContent))

    // Prepare LLM parameters
    const llmParams: LLMStreamParams = {
      temperature: (body.temperature as number) ?? 0.7,
      topP: (body.top_p as number) ?? undefined,
      maxOutputTokens: (body.max_tokens as number) ?? undefined,
      stopSequences:
        typeof body.stop === 'string'
          ? [body.stop]
          : Array.isArray(body.stop)
            ? (body.stop as string[])
            : undefined,
      tools: getAllTools(),
    }

    // Call the streaming handler
    return await handleOrchestratedAgentStream({
      messages,
      params: llmParams,
      threadId,
      userId: user.id,
      userMessageId,
      model: (body.model as string) ?? 'gemini-4.0-flash',
      permissions: null,
    })
  } catch (error) {
    console.error('[Chat Stream] Handler error:', error)
    const message =
      error instanceof Error ? error.message : 'Stream request failed'
    return json(
      {
        error: {
          message,
          type: 'invalid_request_error',
          code: 'server_error',
        },
      },
      { status: 500 },
    )
  }
}
