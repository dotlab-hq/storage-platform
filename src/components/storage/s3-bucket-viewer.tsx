import { useRef, useState } from 'react'
import { ChevronRight, FolderPlus, Home, RefreshCw, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfirmActionDialog } from '@/components/ui/confirm-action-dialog'
import { NewFolderDialog } from '@/components/storage/new-folder-dialog'
import { S3BucketViewerBrowser } from '@/components/storage/s3-bucket-viewer-browser'
import { useS3BucketViewer } from '@/components/storage/use-s3-bucket-viewer'

type S3BucketViewerProps = {
  bucketName: string
  /** Current folder prefix ('' = bucket root). */
  prefix: string
  onPrefixChange: (prefix: string) => void
  readOnly?: boolean
}

const SCROLL_LOAD_THRESHOLD = 0.7

/**
 * Browser for one bucket: breadcrumbs, refresh/new folder/upload actions,
 * the object list and the delete confirmation. Navigation is controlled by
 * the parent (URL search param on the bucket page, local state in the modal).
 */
export function S3BucketViewer({
  bucketName,
  prefix,
  onPrefixChange,
  readOnly = false,
}: S3BucketViewerProps) {
  const viewer = useS3BucketViewer(bucketName, prefix, onPrefixChange)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [pendingDeleteKey, setPendingDeleteKey] = useState<string | null>(null)
  const [newFolderOpen, setNewFolderOpen] = useState(false)

  const totalItems =
    viewer.folders.length + viewer.files.length + viewer.uploadingFiles.length
  const openUploadPicker = () => viewer.inputRef.current?.click()

  const handleScroll = () => {
    const container = scrollContainerRef.current
    if (!container) return
    const { scrollTop, scrollHeight, clientHeight } = container
    if ((scrollTop + clientHeight) / scrollHeight >= SCROLL_LOAD_THRESHOLD) {
      viewer.loadMore()
    }
  }

  return (
    <section className="flex h-full flex-col rounded-xl border border-border/60 bg-background/70 p-4 shadow-lg">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 rounded-full border border-border/60 bg-muted/30 px-3 font-medium text-foreground"
            onClick={() => onPrefixChange('')}
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
                className="h-8 rounded-full border border-border/60 bg-muted/20 px-3 font-medium text-foreground"
                onClick={() => onPrefixChange(crumb.value)}
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
            disabled={viewer.isRefetching}
            onClick={() => viewer.refresh()}
            className="border-border/60 bg-muted/20 text-foreground"
          >
            <RefreshCw
              className={`h-4 w-4 mr-1.5 ${viewer.isRefetching ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
          {!readOnly && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={viewer.busy}
                onClick={() => setNewFolderOpen(true)}
                className="border-border/60 bg-muted/20 text-foreground"
              >
                <FolderPlus className="h-4 w-4 mr-1.5" />
                New Folder
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                disabled={viewer.busy}
                onClick={openUploadPicker}
                className="shadow-sm"
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
            onChange={viewer.handleUpload}
          />
        </div>
      </div>

      <S3BucketViewerBrowser
        viewer={viewer}
        totalItems={totalItems}
        scrollContainerRef={scrollContainerRef}
        onScroll={handleScroll}
        onRequestDelete={setPendingDeleteKey}
        onRequestUpload={openUploadPicker}
        onRequestNewFolder={() => setNewFolderOpen(true)}
        allowMutations={!readOnly}
      />

      <div className="flex items-center justify-between pt-3 text-sm text-muted-foreground">
        <span>{totalItems} items</span>
        {viewer.errorMessage && (
          <span className="text-destructive">{viewer.errorMessage}</span>
        )}
      </div>

      {newFolderOpen && (
        <NewFolderDialog
          open
          onOpenChange={setNewFolderOpen}
          onConfirm={viewer.createFolder}
        />
      )}

      <ConfirmActionDialog
        open={pendingDeleteKey !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteKey(null)
        }}
        title="Delete this file?"
        description="This will permanently remove the selected object."
        confirmLabel="Delete file"
        confirmVariant="destructive"
        requiresConfirmation
        onConfirm={() => {
          if (pendingDeleteKey) viewer.deleteFile(pendingDeleteKey)
          setPendingDeleteKey(null)
        }}
      />
    </section>
  )
}
