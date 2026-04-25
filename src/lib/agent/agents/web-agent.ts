import type { StructuredTool } from '@langchain/core/tools'
import { createWorkerNode } from '../orchestration/graph'
import { TAVILY_TOOL } from '../tools/tavily-search'

/**
 * Web Search Agent
 * Tools: Tavily search
 * Handles queries about current events, research, web lookup
 */
export class WebAgent {
  name = 'web_agent'
  description = 'Searches the web for current information, news, and facts'

  getTools(): StructuredTool[] {
    return [TAVILY_TOOL]
  }

  createNode() {
    return createWorkerNode( this.name, this.getTools() )
  }
}

export const webAgent = new WebAgent()
