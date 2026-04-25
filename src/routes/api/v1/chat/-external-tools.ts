import type { StructuredTool } from '@langchain/core/tools'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { z } from 'zod'

type RequestedTool = {
  type: 'function'
  function: {
    name: string
    description?: string
    parameters?: unknown
    strict?: boolean
  }
}

const ExternalToolInputSchema = z.object({}).passthrough()

export function createExternalPassthroughTools(
  requestedTools: RequestedTool[] | undefined,
  internalToolNames: string[],
): StructuredTool[] {
  if (!requestedTools || requestedTools.length === 0) {
    return []
  }

  const internalNameSet = new Set(internalToolNames)

  return requestedTools
    .filter((tool) => !internalNameSet.has(tool.function.name))
    .map(
      (tool) =>
        new DynamicStructuredTool({
          name: tool.function.name,
          description:
            tool.function.description ||
            `External function ${tool.function.name}`,
          schema: ExternalToolInputSchema,
          func: async (input) =>
            JSON.stringify({
              external: true,
              tool: tool.function.name,
              args: input,
            }),
        }),
    )
}
