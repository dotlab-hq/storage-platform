import { ChatGoogle } from '@langchain/google'

// Validate that API key is available
const apiKey = process.env.GOOGLE_API_KEY
if ( !apiKey ) {
    console.warn(
        '[LLM] GOOGLE_API_KEY is not set. Chat will not generate real responses.',
    )
}

const primaryModel = process.env.CHAT_GOOGLE_MODEL ?? 'gemini-2.0-flash'
const fallbackModel =
    process.env.CHAT_GOOGLE_FALLBACK_MODEL ?? 'gemini-2.0-flash-lite'

const modelConfig = {
    maxRetries: 2,
    temperature: 0.3,
    topP: 0.9,
    topK: 40,
    maxOutputTokens: 1024,
}

export const llm = new ChatGoogle( {
    model: primaryModel,
    ...modelConfig,
    apiKey,
} )

export const fallbackLlm = new ChatGoogle( {
    model: fallbackModel,
    ...modelConfig,
    apiKey,
} )