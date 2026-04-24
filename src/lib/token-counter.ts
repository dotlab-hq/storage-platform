/**
 * Count tokens in a text string using a simple approximation.
 * 1 token ≈ 4 characters for English text.
 */
export function countTokens(text: string): number {
  if (!text || text.length === 0) {
    return 0
  }
  return Math.ceil(text.length / 4)
}

/**
 * Usage statistics
 */
export interface Usage {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}

/**
 * Calculate token usage from messages and completion
 * Note: This is an approximation. For accurate usage, rely on LLM provider's usage data.
 */
export function calculateUsage(
  messages: Array<{ role: string; content: string }>,
  completion: string,
): Usage {
  const promptText = messages.map((m) => `${m.role}: ${m.content}`).join('\n\n')
  const promptTokens = countTokens(promptText)
  const completionTokens = countTokens(completion)

  return {
    prompt_tokens: promptTokens,
    completion_tokens: completionTokens,
    total_tokens: promptTokens + completionTokens,
  }
}

/**
 * Extract usage from Gemini response metadata
 * Gemini returns usage in the response chunks
 */
export function extractUsageFromChunk(chunk: unknown): Usage | null {
  if (!chunk || typeof chunk !== 'object') {
    return null
  }
  const usage = (chunk as any)?.usage
  if (!usage) {
    return null
  }
  const inputTokens = usage.inputTokens ?? usage.promptTokens ?? 0
  const outputTokens = usage.outputTokens ?? usage.completionTokens ?? 0

  return {
    prompt_tokens: inputTokens,
    completion_tokens: outputTokens,
    total_tokens: inputTokens + outputTokens,
  }
}

/**
 * System fingerprint for identifying this backend
 */
export const SYSTEM_FINGERPRINT = 'storage-platform-chat-v1'
