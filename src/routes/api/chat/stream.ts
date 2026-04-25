import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'

export const Route = createFileRoute('/api/chat/stream')({
  server: {
    handlers: {
      POST: POST,
    },
  },
})

async function getUserFromApiKey(
  headers: Headers,
): Promise<{ id: string; email: string; name: string } | null> {
  const authHeader = headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.slice(7)
  if (!token) {
    return null
  }

  try {
    const keyRow = await db.query.apikey.findFirst({
      where: eq(apikey.key, token),
    })

    if (!keyRow) return null
    if (keyRow.expiresAt && new Date(keyRow.expiresAt) < new Date()) return null
    if (keyRow.enabled === false) return null
    if (!hasChatCompletionsScope(keyRow.permissions)) return null

    const user = await db.query.user.findFirst({
      where: eq(db._.fullSchema.user.id, keyRow.userId),
    })

    if (!user) return null

    return {
      id: user.id,
      email: user.email,
      name: user.name ?? 'API User',
    }
  } catch {
    return null
  }
}

function hasChatCompletionsScope(permissions: string | null): boolean {
  if (!permissions) {
    return false
  }

  try {
    const parsed = JSON.parse(permissions) as unknown
    if (!Array.isArray(parsed)) {
      return false
    }

    return parsed.some(
      (value): value is string =>
        typeof value === 'string' && value === 'chat:completions',
    )
  } catch {
    return false
  }
}

async function persistAssistantContent({
  messageId,
  threadId,
  content,
}: {
  messageId: string
  threadId: string
  content: string
}): Promise<void> {
  await db
    .update(chatMessage)
    .set({
      content,
      updatedAt: new Date(),
    })
    .where(eq(chatMessage.id, messageId))

  await refreshThreadLatestMessage(threadId)
}

function withCompatHeaders(
  threadId: string,
  assistantId: string,
  userId: string,
) {
  return {
    'X-Thread-Id': threadId,
    'X-Assistant-Message-Id': assistantId,
    'X-User-Message-Id': userId,
    'Access-Control-Expose-Headers':
      'X-Thread-Id, X-Assistant-Message-Id, X-User-Message-Id',
  }
}

export async function POST({ request }: { request: Request }) {
  try {
    const body = await request.json()
    const normalized = normalizeChatStreamRequest(body)
    const { threadId, content, model, stream: shouldStream } = normalized

    let currentUser = await getAuthenticatedUser().catch(() => null)
    let apiKeyUser = await getUserFromApiKey(request.headers).catch(() => null)

    if (!currentUser && !apiKeyUser) {
      return json(
        {
          error: {
            message: 'Unauthorized - provide valid session or API key',
            type: 'authentication_error',
          },
        },
        { status: 401 },
      )
    }

    const userId = currentUser?.id ?? apiKeyUser!.id

    // Get or create thread
    let thread = threadId ? await findOwnedThread(userId, threadId) : null

    if (threadId && !thread) {
      throw new Error('Thread not found.')
    }

    const now = new Date()

    // Create thread if needed
    if (!thread) {
      const [created] = await db
        .insert(chatThread)
        .values({
          userId: userId,
          title: deriveThreadTitle(content),
          latestPreview: null,
          lastMessageAt: now,
          createdAt: now,
          updatedAt: now,
        })
        .returning({
          id: chatThread.id,
          title: chatThread.title,
          latestPreview: chatThread.latestPreview,
          lastMessageAt: chatThread.lastMessageAt,
          createdAt: chatThread.createdAt,
          updatedAt: chatThread.updatedAt,
        })

      thread = created
    }

    // Insert user message
    const [userMessage] = await db
      .insert(chatMessage)
      .values({
        threadId: thread.id,
        userId: userId,
        role: 'user',
        content,
        regenerationCount: 0,
        createdAt: now,
        updatedAt: now,
      })
      .returning({
        id: chatMessage.id,
        threadId: chatMessage.threadId,
        role: chatMessage.role,
        content: chatMessage.content,
        regenerationCount: chatMessage.regenerationCount,
        createdAt: chatMessage.createdAt,
        updatedAt: chatMessage.updatedAt,
      })

    // Create empty assistant message
    const [assistantMessage] = await db
      .insert(chatMessage)
      .values({
        threadId: thread.id,
        userId: userId,
        role: 'assistant',
        content: '',
        regenerationCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({
        id: chatMessage.id,
        threadId: chatMessage.threadId,
        role: chatMessage.role,
        content: chatMessage.content,
        regenerationCount: chatMessage.regenerationCount,
        createdAt: chatMessage.createdAt,
        updatedAt: chatMessage.updatedAt,
      })

    const completionId = `chatcmpl-${assistantMessage.id}`
    const created = Math.floor(Date.now() / 1000)

    if (!shouldStream) {
      let fullContent = ''

      for await (const chunk of generateAssistantReplyStream(content, 0)) {
        fullContent += chunk
      }

      await persistAssistantContent({
        messageId: assistantMessage.id,
        threadId: thread.id,
        content: fullContent,
      })

      return new Response(
        JSON.stringify(
          toOpenAiCompletion({
            id: completionId,
            created,
            model,
            content: fullContent,
          }),
        ),
        {
          headers: {
            'Content-Type': 'application/json',
            ...withCompatHeaders(
              thread.id,
              assistantMessage.id,
              userMessage.id,
            ),
          },
        },
      )
    }

    // Stream the response
    const encoder = new TextEncoder()
    let fullContent = ''

    const responseStream = new ReadableStream({
      async start(controller) {
        let isClosed = false
        const close = () => {
          if (isClosed) {
            return
          }
          isClosed = true
          controller.close()
        }

        try {
          const abortController = new AbortController()
          const requestAbortHandler = () => abortController.abort()
          request.signal.addEventListener('abort', requestAbortHandler)

          controller.enqueue(
            encoder.encode(
              toSseEvent(
                toOpenAiChunk({
                  id: completionId,
                  created,
                  model,
                  delta: { role: 'assistant' },
                  finishReason: null,
                }),
              ),
            ),
          )

          for await (const chunk of generateAssistantReplyStream(
            content,
            0,
            abortController.signal,
          )) {
            fullContent += chunk

            controller.enqueue(
              encoder.encode(
                toSseEvent(
                  toOpenAiChunk({
                    id: completionId,
                    created,
                    model,
                    delta: { content: chunk },
                    finishReason: null,
                  }),
                ),
              ),
            )
          }

          await persistAssistantContent({
            messageId: assistantMessage.id,
            threadId: thread.id,
            content: fullContent,
          })

          controller.enqueue(
            encoder.encode(
              toSseEvent(
                toOpenAiChunk({
                  id: completionId,
                  created,
                  model,
                  delta: {},
                  finishReason: 'stop',
                }),
              ),
            ),
          )

          controller.enqueue(encoder.encode(toSseEvent('[DONE]')))

          request.signal.removeEventListener('abort', requestAbortHandler)
          close()
        } catch (error) {
          if (error instanceof Error && error.name !== 'AbortError') {
            console.error('[Chat Stream] Error:', error)

            const errorMsg = {
              error: {
                message: error.message,
                type: 'server_error',
              },
            }

            controller.enqueue(encoder.encode(toSseEvent(errorMsg)))
          }

          close()
        }
      },
    })

    return new Response(responseStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        ...withCompatHeaders(thread.id, assistantMessage.id, userMessage.id),
      },
    })
  } catch (error) {
    console.error('[Chat Stream] Request error:', error)
    return json(
      {
        error: {
          message:
            error instanceof Error ? error.message : 'Stream request failed',
          type: 'invalid_request_error',
        },
      },
      { status: 400 },
    )
  }
}
