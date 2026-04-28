import { AIMessage } from '@langchain/core/messages'

interface ContentBlock {
  type: string
  text?: string
  data?: string
  content?: string
}

interface ContentItem {
  type: string
  text?: string
}

export const trimReasoning = (msg: AIMessage): string => {
  let out = ''

  // 1. contentBlocks (preferred)
  const msgAsRecord = msg as Record<string, unknown>
  const blocks = Array.isArray(msgAsRecord.contentBlocks)
    ? (msgAsRecord.contentBlocks as ContentBlock[])
    : []

  for (const b of blocks) {
    if (!['text', 'output_text', 'message'].includes(b.type)) continue

    if (typeof b.text === 'string' && b.text) {
      out += (out ? '\n' : '') + b.text
    } else if (typeof b.data === 'string' && b.data) {
      out += (out ? '\n' : '') + b.data
    } else if (typeof b.content === 'string' && b.content) {
      out += (out ? '\n' : '') + b.content
    }
  }

  if (out) return out

  // 2. fallback → content
  const { content } = msg

  if (typeof content === 'string') return content

  if (Array.isArray(content)) {
    return content
      .filter((c: ContentItem) => c.type === 'text')
      .map((c: ContentItem) => c.text ?? '')
      .join('\n')
  }

  return ''
}
