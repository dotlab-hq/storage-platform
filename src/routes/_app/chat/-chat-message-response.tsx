import { useEffect, useMemo, useState } from 'react'
import { Streamdown } from 'streamdown'
import { cjk } from '@streamdown/cjk'
import { code } from '@streamdown/code'
import { math } from '@streamdown/math'
import { cn } from '@/lib/utils'
import {
  JSXPreview,
  JSXPreviewContent,
  JSXPreviewError,
} from '@/components/ai-elements/jsx-preview'
import {
  Artifact,
  ArtifactAction,
  ArtifactActions,
  ArtifactClose,
  ArtifactContent,
  ArtifactDescription,
  ArtifactHeader,
  ArtifactTitle,
} from '@/components/ai-elements/artifact'
import { Canvas } from '@/components/ai-elements/canvas'

type MermaidPluginType = (typeof import('@streamdown/mermaid'))['mermaid']

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

  const artifactComponents = useMemo(
    () => ({
      Artifact,
      ArtifactAction,
      ArtifactActions,
      ArtifactClose,
      ArtifactContent,
      ArtifactDescription,
      ArtifactHeader,
      ArtifactTitle,
      Canvas,
    }),
    [],
  )

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

  const plugins = mermaidPlugin
    ? { cjk, code, math, mermaid: mermaidPlugin }
    : { cjk, code, math }

  return (
    <div className="space-y-3">
      {artifact ? (
        <div className="overflow-hidden rounded-md border bg-muted/20 p-3">
          <JSXPreview jsx={artifact.jsx} components={artifactComponents}>
            <JSXPreviewError />
            <JSXPreviewContent />
          </JSXPreview>
        </div>
      ) : null}

      {markdownContent.length > 0 ? (
        <Streamdown
          animated
          className={cn(
            'size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
            className,
          )}
          isAnimating={isStreaming}
          plugins={plugins}
        >
          {markdownContent}
        </Streamdown>
      ) : null}
    </div>
  )
}
