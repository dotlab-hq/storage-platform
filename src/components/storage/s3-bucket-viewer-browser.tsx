import { FileText, FolderPlus, Loader2 } from 'lucide-react'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import {
  S3ViewerFolderCard,
  S3ViewerFileListItem,
  S3ViewerUploadingFileListItem,
} from '@/components/storage/s3-bucket-viewer-cards'
import type { useS3BucketViewer } from '@/components/storage/use-s3-bucket-viewer'

type ViewerState = ReturnType<typeof useS3BucketViewer>

type S3BucketViewerBrowserProps = {
  viewer: ViewerState
  totalItems: number
  scrollContainerRef: React.RefObject<HTMLDivElement | null>
  onScroll: () => void
}

export function S3BucketViewerBrowser(props: S3BucketViewerBrowserProps) {
  const { viewer, totalItems, scrollContainerRef, onScroll } = props

  return (
    <div
      ref={scrollContainerRef}
      onScroll={onScroll}
      className="flex-1 overflow-y-auto rounded-lg border"
    >
      {totalItems === 0 ? (
        <div className="flex h-full flex-col items-center justify-center py-12 text-muted-foreground">
          {viewer.isLoading ? (
            <div className="w-full max-w-2xl space-y-3 px-6">
              <PageSkeleton variant="default" className="h-12" />
              <PageSkeleton variant="default" className="h-12" />
              <PageSkeleton variant="default" className="h-12" />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-full bg-muted p-4">
                <FolderPlus className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">Empty folder</p>
              <p className="text-xs text-muted-foreground/70">
                No files or folders found
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4 p-4">
          {viewer.uploadingFiles.length > 0 ? (
            <div className="overflow-hidden rounded-xl border bg-muted/20">
              {viewer.uploadingFiles.map((file) => (
                <S3ViewerUploadingFileListItem key={file.id} file={file} />
              ))}
            </div>
          ) : null}

          {viewer.folders.length > 0 ? (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Folders
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {viewer.folders.map((folder) => (
                  <S3ViewerFolderCard
                    key={folder.prefix}
                    entry={folder}
                    onSelect={() => undefined}
                    onOpen={(targetPrefix) => {
                      void viewer.refresh(targetPrefix)
                    }}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {viewer.files.length > 0 ? (
            <div className="overflow-hidden rounded-xl border">
              <div className="flex items-center border-b bg-muted/30 px-4 py-2.5">
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Name
                  </span>
                </div>
                <div className="w-28 text-right">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Size
                  </span>
                </div>
                <div className="w-32 text-right">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Modified
                  </span>
                </div>
                <div className="w-10" />
              </div>
              <div className="divide-y">
                {viewer.files.map((file) => (
                  <S3ViewerFileListItem
                    key={file.key}
                    entry={file}
                    onOpen={(key) => {
                      void viewer.openFile(key)
                    }}
                    onDelete={(key) => {
                      void viewer.deleteFile(key)
                    }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-xl border border-dashed py-6 text-sm text-muted-foreground">
              <FileText className="mr-2 h-4 w-4" />
              No files in this location
            </div>
          )}
        </div>
      )}
      {viewer.isFetchingNextPage && (
        <div className="flex items-center justify-center border-t py-3">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  )
}
