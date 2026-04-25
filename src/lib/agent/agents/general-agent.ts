import type { StructuredTool } from '@langchain/core/tools'
import { createWorkerNode } from '../orchestration/graph'
import { mathTools } from '../tools/math-tools'

/**
 * General Agent
 * Fallback agent for general conversation + math operations
 * No special scopes required
 */

export class GeneralAgent {
  name = 'general_agent'
  description = 'General-purpose assistant for conversation and calculations'

  getTools(): StructuredTool[] {
    return mathTools
  }

  createNode() {
    return createWorkerNode( this.name, this.getTools() )
  }
}

export const generalAgent = new GeneralAgent()
