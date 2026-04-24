import type { BaseMessage } from '@langchain/core/messages'
import {
  HumanMessage,
  AIMessage,
  ToolMessage,
  SystemMessage,
} from '@langchain/core/messages'
import type { OpenAiMessage, OpenAiToolCall } from '@/routes/api/v1/-schemas'

const SYSTEM_PROMPT =
  'You are Barrage Chat, a practical engineering assistant. Answer clearly and directly in markdown. When useful, include short bullet points and concise code blocks. Be concise and helpful. You have access to math tools (add, subtract, multiply, divide) to help with calculations. Use them when appropriate.'

/**
 * Convert OpenAI message format to LangChain BaseMessage[]
 */
export function openAIMessagesToLangChain(
  messages: OpenAiMessage[],
  includeSystemPrompt: boolean = true,
): BaseMessage[] {
  const langchainMessages: BaseMessage[] = []

  // Add system message if requested and not already present
  if (includeSystemPrompt) {
    langchainMessages.push(new SystemMessage(SYSTEM_PROMPT))
  }

  for (const msg of messages) {
    if (msg.role === 'user') {
      const content = normalizeContent(msg.content)
      langchainMessages.push(new HumanMessage(content))
    } else if (msg.role === 'assistant') {
      const content = normalizeContent(msg.content)
      const aiMessage = new AIMessage(content)

      // Add tool calls if present
      if (msg.tool_calls && msg.tool_calls.length > 0) {
        aiMessage.tool_calls = msg.tool_calls.map((tc) => ({
          id: tc.id,
          name: tc.function.name,
          args: tc.function.arguments ? JSON.parse(tc.function.arguments) : {},
          type: 'tool_call' as const,
        }))
      }

      langchainMessages.push(aiMessage)
    } else if (msg.role === 'tool') {
      const content = normalizeContent(msg.content)
      const toolMessage = new ToolMessage(content, msg.tool_call_id ?? '')
      langchainMessages.push(toolMessage)
    } else if (msg.role === 'system' && includeSystemPrompt) {
      // Override default system prompt if explicitly provided
      langchainMessages[0] = new SystemMessage(normalizeContent(msg.content))
    }
  }

  return langchainMessages
}

/**
 * Normalize OpenAI content (string or content parts array) to plain string
 */
export function normalizeContent(
  content:
    | string
    | Array<{ type: string; text?: string; image_url?: { url: string } }>,
): string {
  if (typeof content === 'string') {
    return content.trim()
  }

  // For array content, extract text parts
  return content
    .map((part) => {
      if (part.type === 'text' && typeof part.text === 'string') {
        return part.text
      }
      if (part.type === 'image_url') {
        return '[Image attachment]'
      }
      return ''
    })
    .join(' ')
    .trim()
}

/**
 * Build tool calls from LangChain AIMessageChunk
 */
export function parseToolCallChunks(
  toolCallChunks: Array<{
    index: number
    id?: string
    name?: string
    args?: string
  }>,
): OpenAiToolCall[] {
  const toolCallsMap = new Map<number, OpenAiToolCall>()

  for (const chunk of toolCallChunks) {
    const { index, id, name, args } = chunk

    if (!toolCallsMap.has(index)) {
      toolCallsMap.set(index, {
        id: id || '',
        type: 'function',
        function: { name: '', arguments: '' },
      })
    }

    const existing = toolCallsMap.get(index)!
    if (id) existing.id = id
    if (name) existing.function.name += name
    if (args) existing.function.arguments += args
  }

  return Array.from(toolCallsMap.values())
}
