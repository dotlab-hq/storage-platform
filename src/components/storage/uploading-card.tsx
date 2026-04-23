import { cn } from '@/lib/utils'
import { formatFileSize } from '@/lib/file-utils'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, AlertCircle, Loader2, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { UploadingFile } from '@/types/storage'

type UploadingCardProps = {
  upload: UploadingFile
  onRetry?: (id: string) => void
}

export function UploadingCard({ upload, onRetry }: UploadingCardProps) {
  const isUploading = upload.status === 'uploading'
  const isCompleted = upload.status === 'completed'
  const isFailed = upload.status === 'failed'

  const isFolder = !!upload.folderName

  return (
    <div
      className={cn(
        'bg-card relative rounded-xl border p-4 transition-all duration-300',
        isUploading && 'opacity-70',
        isCompleted && 'border-emerald-500/50',
        isFailed && 'border-destructive/50',
      )}
    >
      {/* Status icon */}
      <div className="absolute right-2 top-2">
        {isUploading && (
          <Loader2 className="text-primary h-4 w-4 animate-spin" />
        )}
        {isCompleted && (
          <CheckCircle className="h-4 w-4 text-emerald-500 animate-in zoom-in duration-300" />
        )}
        {isFailed && <AlertCircle className="text-destructive h-4 w-4" />}
      </div>

      {/* File/Folder info */}
      <div className="mb-3 truncate pr-6 text-sm font-medium">
        {isFolder ? upload.folderName : upload.file!.name}
      </div>
      <div className="text-muted-foreground mb-2 text-xs">
        {isFolder
          ? `${upload.uploadedFilesCount || 0} / ${upload.totalFilesCount || 0} files`
          : formatFileSize(upload.file!.size)}
      </div>

      {/* Progress */}
      {isUploading && (
        <div className="flex items-center gap-2">
          <Progress value={upload.progress} className="h-1.5 flex-1" />
          <span className="text-muted-foreground w-9 text-right text-xs tabular-nums">
            {upload.progress}%
          </span>
        </div>
      )}
      {isFailed && (
        <div className="flex items-center gap-2">
          <span className="text-destructive text-xs">
            {upload.error ?? 'Upload failed'}
          </span>
          {onRetry && !isFolder && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-xs"
              onClick={() => onRetry(upload.id)}
            >
              <RotateCw className="mr-1 h-3 w-3" />
              Retry
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
