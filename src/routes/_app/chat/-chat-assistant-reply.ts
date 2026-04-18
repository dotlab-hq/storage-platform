import { HumanMessage, SystemMessage } from '@langchain/core/messages'

const CHAT_SYSTEM_PROMPT =
    'You are Barrage Chat, a practical engineering assistant. Answer clearly and directly in markdown. When useful, include short bullet points and concise code blocks. Be concise and helpful.'

export async function generateAssistantReply(
    prompt: string,
    priorCount: number,
): Promise<string> {
    const compactPrompt = prompt.trim().replace( /\s+/g, ' ' )

    if ( compactPrompt.length === 0 ) {
        return 'I received an empty message. How can I assist you today?'
    }

    try {
        const { llm } = await import( '@/llm/gemini.llm' )

        // Use proper LangChain message format
        const messages = [
            new SystemMessage( CHAT_SYSTEM_PROMPT ),
            new HumanMessage( compactPrompt ),
        ]

        const response = await llm.invoke( messages )

        // Handle the response based on LangChain's BaseMessage structure
        const content = response.content

        if ( typeof content === 'string' && content.trim().length > 0 ) {
            return content.trim()
        }

        if ( Array.isArray( content ) ) {
            const textParts: string[] = []
            for ( const part of content ) {
                if ( typeof part === 'string' ) {
                    textParts.push( part )
                } else if (
                    typeof part === 'object' &&
                    part !== null &&
                    'text' in part
                ) {
                    const text = ( part as { text: string } ).text
                    if ( typeof text === 'string' ) {
                        textParts.push( text )
                    }
                }
            }

            const result = textParts.join( '\n' ).trim()
            if ( result.length > 0 ) {
                return result
            }
        }
    } catch ( error ) {
        console.error( '[Chat] LLM Error:', {
            message: error instanceof Error ? error.message : String( error ),
            type: error instanceof Error ? error.constructor.name : typeof error,
        } )
    }

    // Fallback: return a thoughtful response that acknowledges the user
    const suffix = priorCount > 0 ? ` (variation #${priorCount + 1})` : ''
    return `**Response**${suffix}:\n\nI encountered an issue generating a response. Please try again or check that your API keys are properly configured. Your message was: "${compactPrompt}"`
}
