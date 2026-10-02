import { FileText, FolderPlus, Loader2, Upload } from 'lucide-react'
import {
  S3ViewerFileListItem,
  S3ViewerFolderListItem,
  S3ViewerUploadingFileListItem,
} from '@/components/storage/s3-viewer-list-items'
import { S3ViewerRowsSkeleton } from '@/components/storage/s3-bucket-viewer-skeleton'
import type {
  S3ViewerFileEntry,
  S3ViewerFolderEntry,
  UploadingFile,
} from '@/components/storage/s3-viewer-types'
import { Button } from '@/components/ui/button'

/**
 * What the browser needs from its data source. Kept structural so both the
 * bucket viewer and the admin provider browser can drive it.
 */
export type S3BrowserListing = {
  folders: S3ViewerFolderEntry[]
  files: S3ViewerFileEntry[]
  uploadingFiles: UploadingFile[]
  isLoading: boolean
  isFetchingNextPage: boolean
  hasNextPage: boolean
  /** Opens `nextPrefix`, or refetches the current folder when omitted. */
  refresh: (nextPrefix?: string) => unknown
  loadMore: () => unknown
  openFile: (key: string) => unknown
  /** Removes a failed upload row; rows are not dismissable without it. */
  dismissUpload?: (id: string) => void
}

type S3BucketViewerBrowserProps = {
  viewer: S3BrowserListing
  totalItems: number
  scrollContainerRef: React.RefObject<HTMLDivElement | null>
  onScroll: () => void
  onRequestDelete: (key: string) => void
  onRequestUpload: () => void
  onRequestNewFolder: () => void
  allowMutations: boolean
}

/** Scrollable list of uploads, folders and files in the current prefix. */
export function S3BucketViewerBrowser({
  viewer,
  totalItems,
  scrollContainerRef,
  onScroll,
  onRequestDelete,
  onRequestUpload,
  onRequestNewFolder,
  allowMutations,
}: S3BucketViewerBrowserProps) {
  return (
    <div
      ref={scrollContainerRef}
      onScroll={onScroll}
      className="flex-1 overflow-y-auto rounded-lg border border-border/60 bg-background/60"
    >
      {viewer.isLoading ? (
        <S3ViewerRowsSkeleton />
      ) : totalItems === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
          <div className="rounded-full bg-muted p-4">
            <FolderPlus className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">Empty folder</p>
          <p className="text-xs text-muted-foreground/70">
            No files or folders found
          </p>
          {allowMutations && (
            <div className="flex items-center gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={onRequestNewFolder}
                className="border-border/60 bg-muted/20 text-foreground"
              >
                New Folder
              </Button>
              <Button
                size="sm"
                onClick={onRequestUpload}
                className="gap-2 shadow-sm"
              >
                <Upload className="h-4 w-4" />
                Upload
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4 p-4">
          {viewer.uploadingFiles.length > 0 ? (
            <div className="overflow-hidden rounded-xl border bg-muted/20">
              {viewer.uploadingFiles.map((file) => (
                <S3ViewerUploadingFileListItem
                  key={file.id}
                  file={file}
                  onDismiss={viewer.dismissUpload}
                />
              ))}
            </div>
          ) : null}

          {viewer.folders.length > 0 ? (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Folders
              </p>
              <div className="overflow-hidden rounded-xl border border-foreground/10">
                {viewer.folders.map((folder) => (
                  <S3ViewerFolderListItem
                    key={folder.prefix}
                    entry={folder}
                    onOpen={(prefix) => void viewer.refresh(prefix)}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {viewer.files.length > 0 ? (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Files
              </p>
              <div className="overflow-hidden rounded-xl border border-foreground/10">
                {viewer.files.map((file) => (
                  <S3ViewerFileListItem
                    key={file.key}
                    entry={file}
                    onOpen={(key) => void viewer.openFile(key)}
                    onDelete={onRequestDelete}
                    allowDelete={allowMutations}
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

          {viewer.hasNextPage && !viewer.isFetchingNextPage ? (
            <div className="flex justify-center">
              <Button
                size="sm"
                variant="outline"
                onClick={() => void viewer.loadMore()}
              >
                Load more
              </Button>
            </div>
          ) : null}
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
