import { ChatGoogle } from '@langchain/google'

// Use a model that supports function calling (Gemini 1.5 Flash)
const llm = new ChatGoogle({
  model: 'gemini-1.5-flash',
  // Optional: You can fine-tune temperature, etc.
})

// Fallback lightweight model (also supports function calling)
export const Bllm = new ChatGoogle({
  model: 'gemini-1.5-flash-lite',
})

export { llm }
