import { useState, useMemo, useEffect } from 'react'
import { Streamdown } from 'streamdown'
import { cjk } from '@streamdown/cjk'
import { code } from '@streamdown/code'
import { math } from '@streamdown/math'
import { cn } from '@/lib/utils'

type MermaidPluginType = (typeof import('@streamdown/mermaid'))['mermaid']

type StreamdownRendererProps = {
  children: string
  className?: string
  isStreaming?: boolean
  isAnimating?: boolean
}

export function StreamdownRenderer({
  children,
  className,
  isStreaming,
}: StreamdownRendererProps) {
  const [mermaidPlugin, setMermaidPlugin] = useState<MermaidPluginType | null>(
    null,
  )

  const shouldLoadMermaid = useMemo(
    () => children.toLowerCase().includes('```mermaid'),
    [children],
  )

  useEffect(() => {
    if (!shouldLoadMermaid || mermaidPlugin) return
    let mounted = true
    void import('@streamdown/mermaid').then((module) => {
      if (mounted) setMermaidPlugin(() => module.mermaid)
    })
    return () => {
      mounted = false
    }
  }, [mermaidPlugin, shouldLoadMermaid])

  const plugins = mermaidPlugin
    ? { cjk, code, math, mermaid: mermaidPlugin }
    : { cjk, code, math }

  return (
    <Streamdown
      animated
      className={cn(
        'size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
        className,
      )}
      isAnimating={isStreaming}
      plugins={plugins}
    >
      {children}
    </Streamdown>
  )
}

export default StreamdownRenderer
