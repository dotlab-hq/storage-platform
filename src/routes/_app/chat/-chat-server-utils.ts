import type {
  ChatMessageSnapshot,
  ChatRole,
  ChatThreadSnapshot,
} from './-chat-types'
import type { AIMessage } from '@langchain/core/messages'
import { llm } from '@/llm/gemini.llm'
import { trimReasoning } from '@/utils/trimReasoning'

type ThreadRow = {
  id: string
  title: string
  latestPreview: string | null
  lastMessageAt: Date
  createdAt: Date
  updatedAt: Date
}

type MessageRow = {
  id: string
  threadId: string
  role: string
  content: string
  regenerationCount: number
  createdAt: Date
  updatedAt: Date
}

function toRole(value: string): ChatRole {
  return value === 'assistant' ? 'assistant' : 'user'
}

export function toThreadSnapshot(row: ThreadRow): ChatThreadSnapshot {
  return {
    id: row.id,
    title: row.title,
    latestPreview: row.latestPreview,
    lastMessageAt: row.lastMessageAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export function toMessageSnapshot(row: MessageRow): ChatMessageSnapshot {
  return {
    id: row.id,
    threadId: row.threadId,
    role: toRole(row.role),
    content: row.content,
    regenerationCount: row.regenerationCount,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export function deriveThreadTitle(prompt: string): string {
  const normalized = prompt.trim().replace(/\s+/g, ' ')
  if (!normalized) return 'New Chat'
  return normalized.length > 42 ? `${normalized.slice(0, 42)}...` : normalized
}

const CHAT_SYSTEM_PROMPT = [
  'You are Barrage Chat, a practical engineering assistant.',
  'Answer clearly and directly in markdown.',
  'When useful, include short bullet points and concise code blocks.',
].join(' ')

function fallbackAssistantReply(
  prompt: string,
  priorCount: number,
): string {
  const compactPrompt = prompt.trim().replace(/\s+/g, ' ')
  const suffix = priorCount > 0 ? ` (variation #${priorCount + 1})` : ''
  return [
    `Here's a focused response${suffix}:`,
    '',
    compactPrompt
      ? `- You asked: "${compactPrompt}"`
      : '- Your message was received.',
    '- I can refine, expand, or regenerate this answer instantly.',
    '- Use thread actions to rename or delete this conversation.',
  ].join('\n')
}

export async function generateAssistantReply(
  prompt: string,
  priorCount: number,
): Promise<string> {
  const compactPrompt = prompt.trim().replace(/\s+/g, ' ')
  if (!compactPrompt) {
    return fallbackAssistantReply(prompt, priorCount)
  }

  try {
    const response = (await llm.invoke([
      `${CHAT_SYSTEM_PROMPT}`,
      `User: ${compactPrompt}`,
    ])) as AIMessage

    const trimmed = trimReasoning(response).trim()
    if (trimmed.length > 0) {
      return trimmed
    }
  } catch {
    // Gracefully degrade to deterministic output so chat always responds.
  }

  return fallbackAssistantReply(prompt, priorCount)
}
