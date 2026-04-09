import { ChatOllama } from '@langchain/ollama'
import { getFileSummaryModelName, getFileSummaryOllamaBaseUrl } from './config'

export function createSummaryModelClient(): ChatOllama {
  return new ChatOllama({
    model: getFileSummaryModelName(),
    baseUrl: getFileSummaryOllamaBaseUrl(),
    temperature: 0,
    maxRetries: 2,
  })
}
