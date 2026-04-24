import { useEffect, useMemo, useState, lazy, Suspense } from 'react'
import { cn } from '@/lib/utils'

type MermaidPluginType = (typeof import('@streamdown/mermaid'))['mermaid']

const StreamdownRenderer = lazy(
  () => import('@/components/ai-elements/streamdown-renderer'),
)
const ArtifactPreview = lazy(
  () => import('@/components/ai-elements/artifact-preview'),
)

const JSX_FENCE_PATTERN = /```(?:tsx|jsx)\s*([\s\S]*?)```/i
const ARTIFACT_MARKERS = [
  '<Artifact',
  '<Canvas',
  '<ArtifactHeader',
  '<ArtifactContent',
]

type ExtractedArtifact = {
  jsx: string
  markdown: string
}

function extractArtifactBlock(content: string): ExtractedArtifact | null {
  const match = content.match(JSX_FENCE_PATTERN)
  if (!match || typeof match[0] !== 'string' || typeof match[1] !== 'string') {
    return null
  }

  const jsx = match[1].trim()
  const isArtifact = ARTIFACT_MARKERS.some((marker) => jsx.includes(marker))
  if (!isArtifact) {
    return null
  }

  return {
    jsx,
    markdown: content.replace(match[0], '').trim(),
  }
}

type ChatMessageResponseProps = {
  content: string
  className?: string
  isStreaming?: boolean
}

export function ChatMessageResponse({
  content,
  className,
  isStreaming = false,
}: ChatMessageResponseProps) {
  const [mermaidPlugin, setMermaidPlugin] = useState<MermaidPluginType | null>(
    null,
  )

  const artifact = useMemo(() => extractArtifactBlock(content), [content])
  const markdownContent = artifact ? artifact.markdown : content

  const shouldLoadMermaid = useMemo(
    () => markdownContent.toLowerCase().includes('```mermaid'),
    [markdownContent],
  )

  useEffect(() => {
    if (!shouldLoadMermaid || mermaidPlugin) {
      return
    }

    let mounted = true

    void import('@streamdown/mermaid').then((module) => {
      if (mounted) {
        setMermaidPlugin(() => module.mermaid)
      }
    })

    return () => {
      mounted = false
    }
  }, [mermaidPlugin, shouldLoadMermaid])

  return (
    <div className="space-y-3">
      {artifact ? (
        <Suspense
          fallback={
            <div className="h-32 bg-muted/20 animate-pulse rounded-md border" />
          }
        >
          <ArtifactPreview jsx={artifact.jsx} />
        </Suspense>
      ) : null}

      {markdownContent.length > 0 ? (
        <Suspense
          fallback={
            <div className="h-32 bg-muted/20 animate-pulse rounded-md" />
          }
        >
          <StreamdownRenderer className={className} isStreaming={isStreaming}>
            {markdownContent}
          </StreamdownRenderer>
        </Suspense>
      ) : null}
    </div>
  )
}
