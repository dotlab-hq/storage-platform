import { useEffect, useMemo, useState } from 'react'
import { Streamdown } from 'streamdown'
import { cjk } from '@streamdown/cjk'
import { code } from '@streamdown/code'
import { math } from '@streamdown/math'
import { cn } from '@/lib/utils'

type MermaidPluginType = ( typeof import( '@streamdown/mermaid' ) )['mermaid']

type ChatMessageResponseProps = {
    content: string
    className?: string
}

export function ChatMessageResponse( {
    content,
    className,
}: ChatMessageResponseProps ) {
    const [mermaidPlugin, setMermaidPlugin] = useState<MermaidPluginType | null>(
        null,
    )

    const shouldLoadMermaid = useMemo(
        () => content.toLowerCase().includes( '```mermaid' ),
        [content],
    )

    useEffect( () => {
        if ( !shouldLoadMermaid || mermaidPlugin ) {
            return
        }

        let mounted = true

        void import( '@streamdown/mermaid' ).then( ( module ) => {
            if ( mounted ) {
                setMermaidPlugin( () => module.mermaid )
            }
        } )

        return () => {
            mounted = false
        }
    }, [mermaidPlugin, shouldLoadMermaid] )

    const plugins = mermaidPlugin
        ? { cjk, code, math, mermaid: mermaidPlugin }
        : { cjk, code, math }

    return (
        <Streamdown
            className={cn(
                'size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
                className,
            )}
            plugins={plugins}
        >
            {content}
        </Streamdown>
    )
}