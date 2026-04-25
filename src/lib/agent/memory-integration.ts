import type { BaseMessage } from '@langchain/core/messages'
import type { ToolCall } from '@langchain/core/tools'
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
  ToolMessage,
} from '@langchain/core/messages'
import { MemoryManager } from '@/lib/agent/memory-manager'

/**
 * Memory context injection and management for agents
 * Handles reading/writing memory based on scope
 */

/**
 * Augment messages with memory context if user has chat:memory scope
 */
export async function augmentMessagesWithMemory(
  messages: BaseMessage[],
  userId: string,
  threadId: string,
  hasMemoryScope: boolean,
): Promise<BaseMessage[]> {
  if (!hasMemoryScope) {
    return messages
  }

  const memory = await MemoryManager.formatForPrompt(userId, threadId)
  if (!memory) {
    return messages
  }

  // Inject as system message at the beginning
  const systemMsg = new SystemMessage(
    `You have access to long-term memory about this user. Use it to personalize your responses.\n\n${memory}`,
  )

  // Insert after any existing system message, or at the beginning
  const systemIndex = messages.findIndex((m) => m._getType() === 'system')
  if (systemIndex >= 0) {
    const newMessages = [...messages]
    newMessages.splice(systemIndex + 1, 0, systemMsg)
    return newMessages
  }

  return [systemMsg, ...messages]
}

/**
 * Extract facts from assistant's response to store in memory
 * Called after agent generates a response
 */
export async function extractAndStoreMemory(
  userId: string,
  threadId: string,
  userMessage: string,
  assistantMessage: string,
  hasMemoryScope: boolean,
): Promise<void> {
  if (!hasMemoryScope) return

  // Simple fact extraction - look for "User prefers X", "User likes Y" patterns
  const factPatterns = [
    /user\s+(?:prefers|likes|loves|hates|enjoys|wants)\s+([^.,]+)/gi,
    /user\s+is\s+([^.,]+)/gi,
    /user\s+has\s+([^.,]+)/gi,
    /user\s+works\s+as\s+a\s+([^.,]+)/gi,
    /user\s+lives\s+in\s+([^.,]+)/gi,
    /favorite\s+([^:]+):\s*([^.,]+)/gi,
  ]

  const facts: string[] = []

  for (const pattern of factPatterns) {
    const matches = [...assistantMessage.matchAll(pattern)]
    for (const m of matches) {
      const fact = m[0]?.trim()
      if (fact && fact.length < 200 && fact.length > 10) {
        facts.push(fact)
      }
    }
  }

  // Also store explicit context about user's explicit statements
  if (userMessage.toLowerCase().includes('remember')) {
    const rememberMatch = userMessage.match(
      /remember\s+(?:that\s+)?(.+?)(?:\.|$)/i,
    )
    if (rememberMatch?.[1]) {
      facts.push(`User said: "${rememberMatch[1].trim()}"`)
    }
  }

  // Store extracted facts
  if (facts.length > 0) {
    await Promise.all(
      facts.map((fact) => MemoryManager.addFact(userId, threadId, fact)),
    )
  }

  // Store context pairs
  await MemoryManager.setContext(
    userId,
    threadId,
    'last_interaction',
    new Date().toISOString(),
  )
  await MemoryManager.setContext(
    userId,
    threadId,
    'interaction_count',
    String(
      (parseInt(
        (await MemoryManager.get(userId, threadId))?.context
          ?.interaction_count || '0',
      ) || 0) + 1,
    ),
  )
}

/**
 * Format tool calls for OpenAI-compatible storage
 */
export function formatToolCallsForDB(toolCalls: ToolCall[]): string | null {
  if (!toolCalls || toolCalls.length === 0) return null
  return JSON.stringify(
    toolCalls.map((tc) => ({
      id: tc.id,
      type: 'function',
      function: {
        name: tc.name,
        arguments: tc.args ? JSON.stringify(tc.args) : '{}',
      },
    })),
  )
}
