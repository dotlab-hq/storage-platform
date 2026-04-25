import { StructuredTool } from '@langchain/core/tools'
import { z } from 'zod'

const TavilySearchResultSchema = z.object( {
    title: z.string().optional(),
    url: z.string().optional(),
    content: z.string().optional(),
} )

const TavilySearchResponseSchema = z.object( {
    answer: z.string().optional(),
    results: z.array( TavilySearchResultSchema ).optional(),
} )

/**
 * Tavily Search Tool
 * Requires API key scope: chat:tool:web
 *
 * This tool performs web searches using Tavily AI search API.
 * It returns concise, relevant search results.
 */
export class TavilySearchTool extends StructuredTool {
    name = 'tavily_search'
    description =
        'Search the web for current information. Use this to find up-to-date news, facts, or answers to questions that require recent information from the internet.'

    schema = z
        .object( {
            query: z
                .string()
                .min( 3, 'Search query must be at least 3 characters' )
                .describe( 'The search query to look up on the web' ),
            maxResults: z
                .number()
                .min( 1 )
                .max( 10 )
                .optional()
                .default( 5 )
                .describe( 'Maximum number of results to return (1-10, default 5)' ),
            searchDepth: z
                .enum( ['basic', 'advanced'] )
                .optional()
                .default( 'basic' )
                .describe(
                    'Search depth: basic for quick results, advanced for deeper research',
                ),
        } )
        .describe( 'Input schema for Tavily web search' )

    async _call( {
        query,
        maxResults = 5,
        searchDepth = 'basic',
    }: {
        query: string
        maxResults?: number
        searchDepth?: 'basic' | 'advanced'
    } ): Promise<string> {
        const tavilyApiKey = process.env.TAVILY_API_KEY
        if ( !tavilyApiKey ) {
            return 'Error: Tavily API key not configured. Please set TAVILY_API_KEY environment variable.'
        }

        try {
            const response = await fetch( 'https://api.tavily.com/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify( {
                    api_key: tavilyApiKey,
                    query,
                    max_results: maxResults,
                    search_depth: searchDepth,
                    include_answer: true,
                    include_raw_content: false,
                    include_images: false,
                } ),
            } )

            if ( !response.ok ) {
                const errorData = ( await response.json().catch( () => ( {} ) ) ) as {
                    detail?: { message?: string }
                }
                return `Tavily search failed: ${response.status} - ${errorData.detail?.message || response.statusText}`
            }

            const parsedResponse = TavilySearchResponseSchema.safeParse(
                await response.json(),
            )

            if ( !parsedResponse.success ) {
                return 'Tavily search failed: unexpected response format.'
            }

            const data = parsedResponse.data

            // Format results into readable string
            let result = `Search results for "${query}":\n\n`

            if ( data.answer ) {
                result += `**Answer:** ${data.answer}\n\n`
            }

            if ( data.results && data.results.length > 0 ) {
                result += `**Sources:**\n`
                data.results.forEach( ( item, index ) => {
                    result += `${index + 1}. ${item.title || 'Untitled result'}\n`
                    result += `   URL: ${item.url || 'N/A'}\n`
                    result += `   ${( item.content ?? '' ).slice( 0, 300 )}...\n\n`
                } )
            }

            result += `\n_Note: Information may not be current. Verify critical facts._`
            return result
        } catch ( error ) {
            console.error( '[TavilySearch] Error:', error )
            return `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
    }
}

export const TAVILY_TOOL = new TavilySearchTool()
