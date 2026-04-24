import { Suspense } from 'react'
import { Canvas } from './canvas'
import { JSXPreview, JSXPreviewContent, JSXPreviewError } from './jsx-preview'
import {
  Artifact,
  ArtifactAction,
  ArtifactActions,
  ArtifactClose,
  ArtifactContent,
  ArtifactDescription,
  ArtifactHeader,
  ArtifactTitle,
} from './artifact'
import { cn } from '@/lib/utils'

const artifactComponents = {
  Artifact,
  ArtifactAction,
  ArtifactActions,
  ArtifactClose,
  ArtifactContent,
  ArtifactDescription,
  ArtifactHeader,
  ArtifactTitle,
  Canvas,
}

type ArtifactPreviewProps = {
  jsx: string
}

function ArtifactPreviewInner({ jsx }: ArtifactPreviewProps) {
  return (
    <div className="overflow-hidden rounded-md border bg-muted/20 p-3">
      <JSXPreview jsx={jsx} components={artifactComponents}>
        <JSXPreviewError />
        <JSXPreviewContent />
      </JSXPreview>
    </div>
  )
}

export function ArtifactPreview({ jsx }: ArtifactPreviewProps) {
  return (
    <Suspense
      fallback={
        <div className="h-32 bg-muted/20 animate-pulse rounded-md border" />
      }
    >
      <ArtifactPreviewInner jsx={jsx} />
    </Suspense>
  )
}
