import { cn } from '@/lib/utils'
import { formatFileSize } from '@/lib/file-utils'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, AlertCircle, Loader2, RotateCw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { UploadingFile } from '@/types/storage'

type UploadingCardProps = {
  upload: UploadingFile
  onRetry?: ( id: string ) => void
  onRemove?: () => void
  variant?: 'default' | 'compact'
}

function clampText( text: string, maxLength: number ): string {
  if ( text.length <= maxLength ) return text
  return text.slice( 0, maxLength - 3 ) + '...'
}

export function UploadingCard( {
  upload,
  onRetry,
  onRemove,
  variant = 'default',
}: UploadingCardProps ) {
  const isUploading = upload.status === 'uploading'
  const isCompleted = upload.status === 'completed'
  const isFailed = upload.status === 'failed'

  const isFolder = !!upload.folderName

  const fileName = isFolder ? upload.folderName : upload.file!.name
  const clampedName = clampText( fileName, 28 )
  const needsTooltip = fileName.length > 28

  const sizeText = isFolder
    ? `${upload.uploadedFilesCount || 0} / ${upload.totalFilesCount || 0} files`
    : formatFileSize( upload.file!.size )

  // Variant-based styling
  const paddingClass = variant === 'compact' ? 'p-2' : 'p-3'
  const extraLeftPadding = onRemove
    ? variant === 'compact'
      ? 'pl-8'
      : 'pl-10'
    : ''
  const nameSpacingClass = variant === 'compact' ? 'mb-1' : 'mb-2'
  const sizeSpacingClass = variant === 'compact' ? 'mb-1' : 'mb-2'
  const rightPaddingForName = 'pr-6' // leave space for status icon

  return (
    <TooltipProvider>
      <Tooltip open={needsTooltip ? undefined : false}>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'bg-card relative rounded-lg border transition-all duration-300',
              paddingClass,
              extraLeftPadding,
              isUploading && 'opacity-90',
              isCompleted && 'border-emerald-500/30 bg-emerald-500/5',
              isFailed && 'border-destructive/30 bg-destructive/5',
            )}
          >
            {/* Remove button (left side) */}
            {onRemove && (
              <button
                type="button"
                onClick={( e ) => {
                  e.stopPropagation()
                  onRemove()
                }}
                className={cn(
                  'absolute left-2 top-2 flex items-center justify-center rounded-full bg-muted/80 hover:bg-destructive hover:text-destructive-foreground transition-colors',
                  variant === 'compact' ? 'h-5 w-5' : 'h-6 w-6',
                )}
                aria-label="Remove upload"
              >
                <X
                  className={variant === 'compact' ? 'h-3 w-3' : 'h-3.5 w-3.5'}
                />
              </button>
            )}

            {/* Status icon - subtle corner indicator (right side) */}
            <div className="absolute right-2 top-2">
              {isUploading && (
                <Loader2 className="text-primary h-3.5 w-3.5 animate-spin" />
              )}
              {isCompleted && (
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
              )}
              {isFailed && (
                <AlertCircle className="text-destructive h-3.5 w-3.5" />
              )}
            </div>

            {/* File/Folder info - compact */}
            <div
              className={cn(
                'truncate font-medium text-xs',
                rightPaddingForName,
                nameSpacingClass,
              )}
            >
              {clampedName}
            </div>

            {/* Size / file-count */}
            <div
              className={cn(
                'text-muted-foreground text-[11px]',
                sizeSpacingClass,
              )}
            >
              {sizeText}
            </div>

            {/* Size / file-count */}
            <div
              className={cn(
                'text-muted-foreground text-[11px]',
                sizeSpacingClass,
              )}
            >
              {sizeText}
            </div>

            {/* Progress bar */}
            {isUploading && (
              <div className="flex items-center gap-2">
                <Progress value={upload.progress} className="h-1.5 flex-1" />
                <span className="text-muted-foreground w-8 text-right text-[11px] tabular-nums">
                  {upload.progress}%
                </span>
              </div>
            )}

            {/* Error message */}
            {isFailed && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-destructive text-[11px] truncate">
                  {upload.error ?? 'Upload failed'}
                </span>
                {onRetry && !isFolder && !upload.parentUploadId && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-5 px-1.5 text-[11px] shrink-0"
                    onClick={() => onRetry( upload.id )}
                  >
                    <RotateCw className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-xs">
          <p className="text-xs break-all">{fileName}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
