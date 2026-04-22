import { ChatGoogle } from '@langchain/google'

const llm = new ChatGoogle({
  model: 'gemma-4-31b-it',
  reasoningEffort: 'high',
  responseModalities: ['TEXT', 'IMAGE'],
})

export const Bllm = new ChatGoogle({
  model: 'gemini-3.1-flash-lite-preview',
  reasoningEffort: 'high',
  responseModalities: ['TEXT', 'IMAGE'],
})

export { llm }
