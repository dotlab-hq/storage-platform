import { ChatGoogle } from '@langchain/google'

const primaryModel = process.env.CHAT_GOOGLE_MODEL ?? 'gemini-2.0-flash'
const fallbackModel =
    process.env.CHAT_GOOGLE_FALLBACK_MODEL ?? 'gemini-2.0-flash-lite'

export const llm = new ChatGoogle( {
    model: primaryModel,
    maxRetries: 2,
    temperature: 0.2,
} )

export const Bllm = new ChatGoogle( {
    model: fallbackModel,
    maxRetries: 2,
    temperature: 0.2,
} )