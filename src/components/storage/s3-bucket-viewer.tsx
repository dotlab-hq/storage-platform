import {
  ChevronRight,
  FolderPlus,
  Home,
  Loader2,
  RefreshCw,
  Upload,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import {
  S3ViewerFileListItem,
  S3ViewerFolderListItem,
  S3ViewerUploadingFileListItem,
} from '@/components/storage/s3-bucket-viewer-cards'
import { useS3BucketViewer } from '@/components/storage/use-s3-bucket-viewer'

type S3BucketViewerProps = {
  bucketName: string
}

export function S3BucketViewer({ bucketName }: S3BucketViewerProps) {
  const viewer = useS3BucketViewer(bucketName)

  const totalItems =
    viewer.folders.length + viewer.files.length + viewer.uploadingFiles.length

  return (
    <section className="flex flex-col h-full bg-background">
      {/* Header with breadcrumb and actions */}
      <div className="flex items-center justify-between py-3 mb-4">
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
            {viewer.isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1.5" />
            )}
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

      {/* File List Header */}
      <div className="flex items-center px-4 py-2.5 border-b bg-muted/30 rounded-t-lg">
        <div className="flex-1 min-w-0">
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

      {/* File List Content */}
      <div className="flex-1 overflow-y-auto border-x border-b rounded-b-lg">
        {totalItems === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
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
          <div className="divide-y">
            {/* Uploading files - shown at the top */}
            {viewer.uploadingFiles.map((file) => (
              <S3ViewerUploadingFileListItem key={file.id} file={file} />
            ))}
            {/* Folders */}
            {viewer.folders.map((folder) => (
              <S3ViewerFolderListItem
                key={folder.prefix}
                entry={folder}
                onOpen={(targetPrefix) => {
                  void viewer.refresh(targetPrefix)
                }}
              />
            ))}
            {/* Files */}
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
        )}
      </div>

      {/* Footer with item count */}
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
