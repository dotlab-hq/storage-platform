export type OpenAiCompatibleRole = 'system' | 'user' | 'assistant' | 'tool'

export type OpenAiCompatibleContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string; detail?: string } }

export type OpenAiCompatibleToolCall = {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string
  }
}

export type OpenAiCompatibleMessage = {
  role: OpenAiCompatibleRole
  content: string | OpenAiCompatibleContentPart[]
  reasoning_content?: string
  tool_calls?: OpenAiCompatibleToolCall[]
  tool_call_id?: string
  name?: string
}

type NormalizableRecord = Record<string, unknown>

function isRecord(value: unknown): value is NormalizableRecord {
  return !!value && typeof value === 'object'
}

function readString(
  record: NormalizableRecord,
  key: string,
): string | undefined {
  const value = record[key]
  return typeof value === 'string' ? value : undefined
}

function getMessageType(message: unknown): string | undefined {
  if (!isRecord(message)) return undefined
  const getType = message.getType ?? message._getType
  if (typeof getType === 'function') {
    const type = getType.call(message)
    return typeof type === 'string' ? type : undefined
  }
  return readString(message, 'type') ?? readString(message, 'role')
}

function normalizeRole(type: string | undefined): OpenAiCompatibleRole {
  if (type === 'human' || type === 'user') return 'user'
  if (type === 'ai' || type === 'assistant') return 'assistant'
  if (type === 'system') return 'system'
  if (type === 'tool') return 'tool'
  return 'user'
}

function stringifyValue(value: unknown): string {
  if (typeof value === 'string') return value
  if (value === null || value === undefined) return ''
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

function normalizeImageUrl(
  value: unknown,
): { url: string; detail?: string } | null {
  if (typeof value === 'string') return { url: value }
  if (!isRecord(value) || typeof value.url !== 'string') return null
  return {
    url: value.url,
    ...(typeof value.detail === 'string' ? { detail: value.detail } : {}),
  }
}

export function normalizeOpenAiContent(content: unknown): {
  content: string | OpenAiCompatibleContentPart[]
  text: string
  reasoning: string
} {
  if (typeof content === 'string') {
    return { content, text: content, reasoning: '' }
  }
  if (!Array.isArray(content)) {
    const text = stringifyValue(content)
    return { content: text, text, reasoning: '' }
  }

  const parts: OpenAiCompatibleContentPart[] = []
  const textChunks: string[] = []
  const reasoningChunks: string[] = []

  for (const part of content) {
    if (typeof part === 'string') {
      parts.push({ type: 'text', text: part })
      textChunks.push(part)
      continue
    }
    if (!isRecord(part)) continue

    const type = readString(part, 'type')
    const text = readString(part, 'text') ?? readString(part, 'content')
    const reasoning =
      readString(part, 'reasoning') ?? readString(part, 'reasoning_content')

    if (type === 'reasoning' || part.thought === true) {
      const thoughtText = reasoning ?? text ?? stringifyValue(part)
      reasoningChunks.push(thoughtText)
      continue
    }

    const imageUrl = normalizeImageUrl(part.image_url ?? part.imageUrl)
    if (type === 'image_url' && imageUrl) {
      parts.push({ type: 'image_url', image_url: imageUrl })
      continue
    }

    const finalText = text ?? stringifyValue(part)
    parts.push({ type: 'text', text: finalText })
    textChunks.push(finalText)
  }

  return {
    content:
      parts.length === 1 && parts[0]?.type === 'text' ? parts[0].text : parts,
    text: textChunks.join(''),
    reasoning: reasoningChunks.join('\n'),
  }
}

function normalizeToolCalls(
  message: NormalizableRecord,
): OpenAiCompatibleToolCall[] | undefined {
  const candidates = [message.tool_calls, message.toolCalls]
  const calls: OpenAiCompatibleToolCall[] = []

  for (const candidate of candidates) {
    if (!Array.isArray(candidate)) continue
    for (const value of candidate) {
      if (!isRecord(value)) continue
      const nestedFunction = isRecord(value.function)
        ? value.function
        : undefined
      const name = readString(nestedFunction ?? value, 'name')
      if (!name) continue
      const rawArgs =
        nestedFunction?.arguments ?? value.args ?? value.arguments ?? {}
      calls.push({
        id: readString(value, 'id') ?? '',
        type: 'function',
        function: { name, arguments: stringifyValue(rawArgs) },
      })
    }
  }

  return calls.length > 0 ? calls : undefined
}

function normalizeOne(message: unknown): OpenAiCompatibleMessage {
  if (!isRecord(message)) {
    return { role: 'user', content: stringifyValue(message) }
  }

  const role = normalizeRole(getMessageType(message))
  const normalized = normalizeOpenAiContent(
    message.contentBlocks ?? message.content,
  )
  const toolCalls = normalizeToolCalls(message)
  const toolCallId =
    readString(message, 'tool_call_id') ?? readString(message, 'toolCallId')
  const name = readString(message, 'name')
  const reasoning =
    normalized.reasoning ||
    readString(message, 'reasoning_content') ||
    readString(message, 'reasoning')

  return {
    role,
    content: normalized.content,
    ...(reasoning ? { reasoning_content: reasoning } : {}),
    ...(toolCalls ? { tool_calls: toolCalls } : {}),
    ...(toolCallId ? { tool_call_id: toolCallId } : {}),
    ...(name ? { name } : {}),
  }
}

export function normalizeOpenAiMessage(
  message: unknown,
): OpenAiCompatibleMessage
export function normalizeOpenAiMessage(
  message: unknown[],
): OpenAiCompatibleMessage[]
export function normalizeOpenAiMessage(
  message: unknown | unknown[],
): OpenAiCompatibleMessage | OpenAiCompatibleMessage[] {
  return Array.isArray(message)
    ? message.map(normalizeOne)
    : normalizeOne(message)
}
