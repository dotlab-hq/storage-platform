const CHAT_SYSTEM_PROMPT = [
    'You are Barrage Chat, a practical engineering assistant.',
    'Answer clearly and directly in markdown.',
    'When useful, include short bullet points and concise code blocks.',
].join( ' ' )

type UnknownRecord = Record<string, unknown>

function isRecord( value: unknown ): value is UnknownRecord {
    return typeof value === 'object' && value !== null
}

function readString( value: unknown ): string {
    return typeof value === 'string' ? value : ''
}

function extractTextFromContentBlocks( value: unknown ): string {
    if ( !Array.isArray( value ) ) {
        return ''
    }

    const fragments: string[] = []
    for ( const entry of value ) {
        if ( !isRecord( entry ) ) {
            continue
        }

        const type = readString( entry.type )
        if ( !['text', 'output_text', 'message'].includes( type ) ) {
            continue
        }

        const candidate =
            readString( entry.text ) ||
            readString( entry.data ) ||
            readString( entry.content )

        if ( candidate.length > 0 ) {
            fragments.push( candidate )
        }
    }

    return fragments.join( '\n' )
}

function extractTextFromContent( value: unknown ): string {
    if ( typeof value === 'string' ) {
        return value
    }

    if ( !Array.isArray( value ) ) {
        return ''
    }

    const parts: string[] = []
    for ( const entry of value ) {
        if ( !isRecord( entry ) ) {
            continue
        }

        if ( readString( entry.type ) !== 'text' ) {
            continue
        }

        const text = readString( entry.text )
        if ( text.length > 0 ) {
            parts.push( text )
        }
    }

    return parts.join( '\n' )
}

function extractAssistantText( response: unknown ): string {
    if ( !isRecord( response ) ) {
        return ''
    }

    const fromBlocks = extractTextFromContentBlocks( response.contentBlocks )
    if ( fromBlocks.length > 0 ) {
        return fromBlocks
    }

    return extractTextFromContent( response.content )
}

function fallbackAssistantReply( prompt: string, priorCount: number ): string {
    const compactPrompt = prompt.trim().replace( /\s+/g, ' ' )
    const suffix = priorCount > 0 ? ` (variation #${priorCount + 1})` : ''

    return [
        `Here's a focused response${suffix}:`,
        '',
        compactPrompt
            ? `- You asked: "${compactPrompt}"`
            : '- Your message was received.',
        '- I can refine, expand, or regenerate this answer instantly.',
        '- Use thread actions to rename or delete this conversation.',
    ].join( '\n' )
}

export async function generateAssistantReply(
    prompt: string,
    priorCount: number,
): Promise<string> {
    const compactPrompt = prompt.trim().replace( /\s+/g, ' ' )
    if ( compactPrompt.length === 0 ) {
        return fallbackAssistantReply( prompt, priorCount )
    }

    try {
        const { llm } = await import( '@/llm/gemini.llm' )
        const response = await llm.invoke( [
            CHAT_SYSTEM_PROMPT,
            `User: ${compactPrompt}`,
        ] )

        const trimmed = extractAssistantText( response ).trim()
        if ( trimmed.length > 0 ) {
            return trimmed
        }
    } catch {
        // Gracefully degrade to deterministic output so chat always responds.
    }

    return fallbackAssistantReply( prompt, priorCount )
}
