import { ChevronRight, FolderPlus, Home, RefreshCw, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { S3BucketViewerBrowser } from '@/components/storage/s3-bucket-viewer-browser'
import { useS3BucketViewer } from '@/components/storage/use-s3-bucket-viewer'
import type { S3ListResponse } from '@/components/storage/use-s3-bucket-viewer'
import { useCallback, useRef } from 'react'

type S3BucketViewerProps = {
  bucketName: string
  initialPrefix?: string
  initialData?: S3ListResponse
}

export function S3BucketViewer({
  bucketName,
  initialPrefix,
  initialData,
}: S3BucketViewerProps) {
  const viewer = useS3BucketViewer(bucketName, {
    initialPrefix,
    initialData,
  })
  const scrollContainerRef = useRef<HTMLDivElement>(null)

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
    <section className="flex h-full flex-col bg-background">
      <div className="mb-4 flex items-center justify-between py-3">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 px-2 font-medium"
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
                className="h-8 px-2 font-medium"
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
          >
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Refresh
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={viewer.busy}
            onClick={() => void viewer.createFolder()}
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
          >
            <Upload className="h-4 w-4 mr-1.5" />
            Upload
          </Button>
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
    </section>
  )
}
