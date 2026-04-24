import { z } from 'zod'

// OpenAI message content types
type OpenAiMessageContentPart = {
  type: string
  text?: string
  image_url?: {
    url: string
    detail?: string
  }
}

type OpenAiMessageContent = string | OpenAiMessageContentPart[]

// OpenAI message structure
export type OpenAiMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: OpenAiMessageContent
  name?: string
  tool_calls?: OpenAiToolCall[]
  tool_call_id?: string
}

// Tool call structure
export type OpenAiToolCall = {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string
  }
}

// Tool definition
export type OpenAiTool = {
  type: 'function'
  function: {
    name: string
    description?: string
    parameters?: Record<string, unknown>
    strict?: boolean
  }
}

// Delta for streaming chunks
export type OpenAiChunkDelta = {
  role?: 'assistant' | 'user' | 'system' | 'tool'
  content?: string
  tool_calls?: Array<{
    index: number
    id?: string
    type?: 'function'
    function: {
      name?: string
      arguments?: string
    }
  }>
}

// Completion chunk
export type OpenAiChunk = {
  id: string
  object: 'chat.completion.chunk'
  created: number
  model: string
  choices: Array<{
    index: number
    delta: OpenAiChunkDelta
    finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  system_fingerprint?: string
}

// Final non-streaming response
export type OpenAiCompletion = {
  id: string
  object: 'chat.completion'
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: 'assistant'
      content: string
      tool_calls?: OpenAiToolCall[]
    }
    finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter'
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  system_fingerprint?: string
}

// Tool choice
export type ToolChoice =
  | 'auto'
  | 'none'
  | 'required'
  | { type: 'function'; function: { name: string } }

// Response format
export type ResponseFormat = {
  type: 'text' | 'json_object'
  json_schema?: unknown
}

// Main chat completions request schema
export const OpenAIChatCompletionsSchema = z
  .object({
    model: z.string().optional().default('gemini-4.0-flash'),
    messages: z
      .array(
        z.object({
          role: z.enum(['system', 'user', 'assistant', 'tool']),
          content: z.union([
            z.string(),
            z.array(
              z
                .object({
                  type: z.string(),
                  text: z.string().optional(),
                  image_url: z
                    .object({
                      url: z.string(),
                      detail: z.string().optional(),
                    })
                    .optional(),
                })
                .passthrough(),
            ),
          ]),
          name: z.string().optional(),
          tool_calls: z
            .array(
              z.object({
                id: z.string(),
                type: z.literal('function'),
                function: z.object({
                  name: z.string(),
                  arguments: z.string(),
                }),
              }),
            )
            .optional(),
          tool_call_id: z.string().optional(),
        }),
      )
      .min(1),
    stream: z.boolean().optional().default(false),

    // Generation parameters
    temperature: z.number().min(0).max(2).optional(),
    top_p: z.number().min(0).max(1).optional(),
    max_tokens: z.number().int().min(1).max(8192).optional(),
    frequency_penalty: z.number().min(-2).max(2).optional(),
    presence_penalty: z.number().min(-2).max(2).optional(),
    stop: z.union([z.string(), z.array(z.string())]).optional(),
    seed: z.number().int().optional(),

    // Tool calling
    tools: z
      .array(
        z.object({
          type: z.literal('function'),
          function: z.object({
            name: z.string(),
            description: z.string().optional(),
            parameters: z.record(z.string(), z.unknown()).optional(),
            strict: z.boolean().optional(),
          }),
        }),
      )
      .optional(),
    tool_choice: z
      .union([
        z.literal('auto'),
        z.literal('none'),
        z.literal('required'),
        z.object({
          type: z.literal('function'),
          function: z.object({ name: z.string() }),
        }),
      ])
      .optional(),

    // Response format
    response_format: z
      .object({
        type: z.enum(['text', 'json_object']),
        json_schema: z.record(z.string(), z.unknown()).optional(),
      })
      .optional(),

    // Logprobs
    logprobs: z.boolean().optional(),
    top_logprobs: z.number().int().min(0).max(20).optional(),

    // User identifier
    user: z.string().optional(),
    // Thread identifier (custom extension)
    thread_id: z.string().optional(),
    threadId: z.string().optional(),
  })
  .passthrough()

// Normalized request for internal use
export type NormalizedV1ChatRequest = {
  messages: Array<{
    role: string
    content: string
    name?: string
    toolCallId?: string
    toolCalls?: OpenAiToolCall[]
  }>
  model: string
  stream: boolean
  temperature?: number
  topP?: number
  maxTokens?: number
  frequencyPenalty?: number
  presencePenalty?: number
  stopSequences?: string[]
  seed?: number
  tools?: OpenAiTool[]
  toolChoice?: ToolChoice
  responseFormat?: { type: 'text' | 'json_object' }
  logprobs?: boolean
  topLogprobs?: number
  user?: string
  threadId?: string
}
