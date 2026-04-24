import { ChatGoogle } from '@langchain/google'

const llm = new ChatGoogle({
  model: 'gemini-2.5-pro-preview-03-25',
  thinkingConfig: {
    includeThoughts: true,
    thinkingLevel: 'high',
  },
  responseModalities: ['TEXT', 'IMAGE'],
})

export const Bllm = new ChatGoogle({
  model: 'gemini-2.5-flash-preview-04-17',
  thinkingConfig: {
    includeThoughts: true,
    thinkingLevel: 'high',
  },
  responseModalities: ['TEXT', 'IMAGE'],
})

export { llm }
