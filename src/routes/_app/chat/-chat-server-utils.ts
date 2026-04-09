import type {
  ChatMessageSnapshot,
  ChatRole,
  ChatThreadSnapshot,
} from './-chat-types'

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

export function generateAssistantReply(
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
