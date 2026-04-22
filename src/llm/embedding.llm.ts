import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'

const embedModel = new GoogleGenerativeAIEmbeddings({
  model: 'gemini-embedding-2-preview', // 768 dimensions
  maxConcurrency: 15,
  maxRetries: 4,
})

export { embedModel }
