import { Bllm, llm } from '@/llm/gemini.llm'
import { trimReasoning } from '@/utils/trimReasoning'

const RETRY_LIMIT = 3

export const generateText = async (
  prompt: string,
  count = 0,
): Promise<string> => {
  const model = count >= 2 ? Bllm : llm
  const res = await model.invoke(prompt)

  const response = trimReasoning(res)

  if (response) return response

  if (count > RETRY_LIMIT) {
    throw new Error('No text output after retries')
  }

  return generateText(prompt, count + 1)
}
