import { ChevronRight, FolderPlus, Home, RefreshCw, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { S3BucketViewerBrowser } from '@/components/storage/s3-bucket-viewer-browser'
import { useS3BucketViewer } from '@/components/storage/use-s3-bucket-viewer'
import type { S3ListResponse } from '@/components/storage/s3-viewer-types'
import { ConfirmActionDialog } from '@/components/ui/confirm-action-dialog'
import { useCallback, useRef, useState } from 'react'

type S3BucketViewerProps = {
  bucketName: string
  initialPrefix?: string
  initialData?: S3ListResponse
  readOnly?: boolean
}

export function S3BucketViewer({
  bucketName,
  initialPrefix,
  initialData,
  readOnly = false,
}: S3BucketViewerProps) {
  const viewer = useS3BucketViewer(bucketName, {
    initialPrefix,
    initialData,
  })
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [pendingDeleteKey, setPendingDeleteKey] = useState<string | null>(null)

  const totalItems =
    viewer.folders.length + viewer.files.length + viewer.uploadingFiles.length

  // Handle infinite scroll: load more when user scrolls near bottom (~70%)
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container || !viewer.hasNextPage || viewer.isFetchingNextPage) return
    const { scrollTop, scrollHeight, clientHeight } = container
    const progress = (scrollTop + clientHeight) / scrollHeight
    if (progress >= 0.7) {
      void viewer.loadMore()
    }
  }, [viewer])

  return (
    <section className="flex h-full flex-col rounded-xl border border-emerald-500/20 bg-background/70 p-4 shadow-lg">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 rounded-full border border-emerald-500/30 bg-muted/30 px-3 font-medium text-emerald-100"
            onClick={() => void viewer.refresh('')}
          >
            <Home className="h-4 w-4 mr-1.5" />
            {bucketName}
          </Button>

          {viewer.breadcrumbs.map((crumb) => (
            <div key={crumb.value} className="flex items-center">
              <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 rounded-full border border-emerald-500/20 bg-muted/20 px-3 font-medium text-emerald-100"
                onClick={() => void viewer.refresh(crumb.value)}
              >
                {crumb.label}
              </Button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={viewer.busy}
            onClick={() => void viewer.refresh()}
            className="border-emerald-500/30 bg-muted/20 text-emerald-100"
          >
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Refresh
          </Button>
          {!readOnly && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={viewer.busy}
                onClick={() => void viewer.createFolder()}
                className="border-emerald-500/30 bg-muted/20 text-emerald-100"
              >
                <FolderPlus className="h-4 w-4 mr-1.5" />
                New Folder
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                disabled={viewer.busy}
                onClick={() => viewer.inputRef.current?.click()}
                className="shadow-[0_0_14px_rgba(16,185,129,0.35)]"
              >
                <Upload className="h-4 w-4 mr-1.5" />
                Upload
              </Button>
            </>
          )}
          <Input
            ref={viewer.inputRef}
            className="hidden"
            type="file"
            onChange={(event) => {
              void viewer.handleUpload(event)
            }}
          />
        </div>
      </div>

      <S3BucketViewerBrowser
        viewer={viewer}
        totalItems={totalItems}
        scrollContainerRef={scrollContainerRef}
        onScroll={handleScroll}
        onRequestDelete={(key) => setPendingDeleteKey(key)}
        onRequestUpload={() => viewer.inputRef.current?.click()}
        onRequestNewFolder={() => void viewer.createFolder()}
        allowMutations={!readOnly}
      />

      <div className="flex items-center justify-between pt-3 text-sm text-muted-foreground">
        <span>{totalItems} items</span>
        {viewer.message && (
          <span
            className={
              viewer.message.toLowerCase().includes('error')
                ? 'text-destructive'
                : ''
            }
          >
            {viewer.message}
          </span>
        )}
      </div>

      <ConfirmActionDialog
        open={pendingDeleteKey !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDeleteKey(null)
          }
        }}
        title="Delete this file?"
        description="This will permanently remove the selected object."
        confirmLabel="Delete file"
        confirmVariant="destructive"
        requiresConfirmation
        onConfirm={async () => {
          if (pendingDeleteKey) {
            await viewer.deleteFile(pendingDeleteKey)
            setPendingDeleteKey(null)
          }
        }}
      />
    </section>
  )
}
