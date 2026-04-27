'use client'

import * as React from 'react'
import {
  useUploadStore,
  removeUpload,
  removeUploadWithChildren,
} from '@/lib/stores/upload-store'
import { retryUploadById } from '@/lib/upload-utils'
import { authClient } from '@/lib/auth-client'
import { toast } from '@/components/ui/sonner'
import { UploadingCard } from '@/components/storage/uploading-card'
import { Upload, X, ChevronDown, CheckCircle2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function UploadWidget() {
  const uploads = useUploadStore((state) => state.uploads)
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [isVisible, setIsVisible] = React.useState(false)

  const activeUploads = uploads.filter((u) => u.status === 'uploading')
  const completedCount = uploads.filter((u) => u.status === 'completed').length
  const failedCount = uploads.filter((u) => u.status === 'failed').length

  // Calculate overall progress (0-100)
  const overallProgress =
    activeUploads.length > 0
      ? Math.round(
          activeUploads.reduce((sum, u) => sum + u.progress, 0) /
            activeUploads.length,
        )
      : completedCount > 0 || failedCount > 0
        ? 100
        : 0

  // Auto-show widget when uploads appear
  React.useEffect(() => {
    if (uploads.length > 0) {
      setIsVisible(true)
    }
  }, [uploads.length])

  // Callbacks - defined before conditional return to maintain hook order
  const handleRetryUpload = React.useCallback(async (uploadId: string) => {
    const { data } = await authClient.getSession()
    const uid = data?.user?.id
    if (!uid) {
      toast.error('Session not ready. Please sign in again.')
      return
    }

    const success = await retryUploadById(uploadId, uid)
    if (!success) {
      toast.error('Retry failed. Please try uploading again.')
    }
  }, [])

  const handleRetryAll = React.useCallback(async () => {
    const { data } = await authClient.getSession()
    const uid = data?.user?.id
    if (!uid) {
      toast.error('Session not ready. Please sign in again.')
      return
    }

    const retryableIds = uploads
      .filter(
        (upload) =>
          upload.status === 'failed' && !!upload.file && !upload.folderName,
      )
      .map((upload) => upload.id)

    if (retryableIds.length === 0) {
      toast.error('No retryable uploads found.')
      return
    }

    const queue = [...retryableIds]
    const workers = Math.min(3, queue.length)
    const worker = async () => {
      while (queue.length > 0) {
        const nextId = queue.shift()
        if (!nextId) break
        await retryUploadById(nextId, uid)
      }
    }

    await Promise.all(Array.from({ length: workers }, () => worker()))
  }, [uploads])

  // Never auto-hide; user manually dismisses with X button
  if (!isVisible || uploads.length === 0) return null

  const handleClose = () => {
    setIsVisible(false)
  }

  const handleClearCompleted = () => {
    uploads.forEach((u) => {
      if (u.status === 'completed') removeUpload(u.id)
    })
  }

  // Circular progress: SVG stroke-dasharray trick
  const size = 48
  const strokeWidth = 3
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset =
    circumference - (overallProgress / 100) * circumference

  return (
    <TooltipProvider>
      <div
        className={cn(
          'fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out',
          isVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-4 pointer-events-none',
        )}
      >
        {/* Main circular badge */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="relative flex items-center justify-center w-12 h-12 rounded-full bg-background border border-border shadow-lg hover:shadow-xl transition-shadow"
              aria-label={`Uploads: ${activeUploads.length} active, ${completedCount} completed, ${failedCount} failed`}
            >
              {/* Circular progress ring */}
              <svg
                className="absolute inset-0 -rotate-90"
                width={size}
                height={size}
              >
                {/* Background circle */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  className="text-muted/20"
                />
                {/* Progress arc */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className={cn(
                    'transition-all duration-200',
                    failedCount > 0
                      ? 'text-destructive'
                      : activeUploads.length > 0
                        ? 'text-primary'
                        : 'text-emerald-500',
                  )}
                />
              </svg>

              {/* Center icon / count */}
              <div className="relative flex items-center justify-center">
                {activeUploads.length > 0 ? (
                  <Upload
                    className={cn(
                      'h-5 w-5',
                      failedCount > 0
                        ? 'text-destructive'
                        : 'text-primary animate-pulse',
                    )}
                  />
                ) : uploads.length > 0 ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : null}
              </div>

              {/* Close button - top right, always visible */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleClose()
                }}
                className="absolute -top-1 -right-1 z-10 flex items-center justify-center w-5 h-5 rounded-full bg-muted border border-border hover:bg-accent transition-colors"
                aria-label="Close upload widget"
              >
                <X className="h-3 w-3" />
              </button>
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p className="text-xs">
              {activeUploads.length > 0
                ? `${activeUploads.length} uploading...`
                : `${uploads.length} upload${uploads.length !== 1 ? 's' : ''}`}
            </p>
          </TooltipContent>
        </Tooltip>

        {/* Expanded dropdown panel */}
        {isExpanded && (
          <div className="absolute bottom-full right-0 mb-2 w-72 rounded-xl border bg-card shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-2 border-b">
              <div className="flex items-center gap-2 truncate">
                <span className="text-sm font-semibold">Uploads</span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  ({activeUploads.length} active, {completedCount} done,
                  {failedCount > 0 ? ` ${failedCount} failed` : ''})
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsExpanded(false)
                  }}
                  className="hover:bg-muted rounded p-1 transition-colors"
                  aria-label="Collapse"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsExpanded(false)
                    setIsVisible(false)
                  }}
                  className="hover:bg-muted rounded p-1 transition-colors"
                  aria-label="Close upload widget"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Upload list */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-2">
              {uploads.map((upload) => (
                <div key={upload.id} className="relative group">
                  <UploadingCard
                    upload={upload}
                    onRetry={!upload.folderName ? handleRetryUpload : undefined}
                    variant="compact"
                    onRemove={() => {
                      if (upload.folderName) {
                        removeUploadWithChildren(upload.id)
                      } else {
                        removeUpload(upload.id)
                      }
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Footer actions */}
            {(completedCount > 0 || failedCount > 0) && (
              <div className="p-2 border-t flex gap-2">
                {completedCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={handleClearCompleted}
                  >
                    <Trash2 className="h-3 w-3 mr-1.5" />
                    Clear completed
                  </Button>
                )}
                {failedCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs text-destructive hover:text-destructive"
                    onClick={() => {
                      void handleRetryAll()
                    }}
                  >
                    Retry all
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
