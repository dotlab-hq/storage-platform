import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { llm } from '@/llm/gemini.llm'
import { trimReasoning } from '@/utils/trimReasoning'

const RETRY_LIMIT = 3


export const describeImage = async (
    imageUrl: string,
    count = 0,
): Promise<string> => {
    /*
 Describe any image given its URL, return a concise description.
    */
    let base64: string
    let mime = 'image/jpeg'

    if ( imageUrl.startsWith( 'data:' ) ) {
        const match = imageUrl.match( /^data:(.*?);base64,(.*)$/ )
        if ( !match ) throw new Error( 'Invalid data URL' )
        mime = match[1] || mime
        base64 = match[2]!
    } else {
        const resp = await fetch( imageUrl )
        if ( !resp.ok ) throw new Error( `Failed to fetch image: ${resp.status}` )
        const ab = await resp.arrayBuffer()
        const arr = new Uint8Array( ab )
        base64 = Buffer.from( arr ).toString( 'base64' )
        const ct = resp.headers.get( 'content-type' )
        if ( ct ) mime = ct
    }

    const systemMessage = new SystemMessage(
        'You are a concise image description assistant. Return only a short description of the image, no extra commentary.',
    )



    const humanMessage = new HumanMessage( {
        contentBlocks: [
            {
                type: 'text',
                text: 'Describe the image attached. Keep it to one short paragraph and return only the description text.',
            },
            {
                type: 'image',
                mimeType: mime,
                data: base64,
            },
        ],
    } )

    const res = await llm.invoke( [systemMessage, humanMessage] )

    const response = trimReasoning( res )

    if ( response ) return response
    if ( count > RETRY_LIMIT ) {
        throw new Error( 'No description returned after retries' )
    }

    return describeImage( imageUrl, count + 1 )
}