'use client'

import * as React from 'react'
import { useUploadStore } from '@/lib/stores/upload-store'
import { UploadingCard } from '@/components/storage/uploading-card'
import { Upload, X, ChevronUp, ChevronDown, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function UploadWidget() {
  const uploads = useUploadStore((state) => state.uploads)
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [isVisible, setIsVisible] = React.useState(true)

  // Show widget if there are any active, completed (not yet auto-dismissed), or failed uploads
  const activeUploads = uploads.filter((u) => u.status === 'uploading')
  const failedUploads = uploads.filter((u) => u.status === 'failed')

  // Hide widget if no uploads at all
  const hasAnyUploads = uploads.length > 0

  // Auto-hide after a delay when all uploads are done (success or failure)
  React.useEffect(() => {
    if (!hasAnyUploads) {
      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(true)
    }
  }, [hasAnyUploads])

  // Don't render if not visible and no uploads
  if (!isVisible && !hasAnyUploads) {
    return null
  }

  const totalCount = uploads.length
  const activeCount = activeUploads.length
  const hasFailed = failedUploads.length > 0

  const handleClose = () => {
    setIsVisible(false)
    // Optionally clear completed uploads when manually closing
    // Could also just hide the widget but keep uploads in store
  }

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50 w-80 transition-all duration-300 ease-in-out',
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4 pointer-events-none',
      )}
    >
      <div className="rounded-xl border bg-card shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 hover:underline"
          >
            <div className="flex items-center gap-2">
              {activeCount > 0 ? (
                <div className="relative">
                  <Upload className="h-4 w-4 text-primary animate-pulse" />
                </div>
              ) : (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              )}
              <span className="text-sm font-semibold">
                {activeCount > 0
                  ? `${activeCount} uploading${totalCount > 1 ? '...' : ''}`
                  : 'Uploads'}
              </span>
            </div>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleClose}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        {/* Content - Upload list */}
        <div
          className={cn(
            'overflow-y-auto transition-all duration-300 ease-in-out',
            isExpanded ? 'max-h-96' : 'max-h-0',
          )}
        >
          <div className="p-2 space-y-2">
            {uploads.map((upload) => (
              <div key={upload.id} className="relative">
                <UploadingCard upload={upload} />
              </div>
            ))}
          </div>
        </div>

        {/* Mini progress bar when collapsed */}
        {!isExpanded && activeCount > 0 && (
          <div className="px-3 pb-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Overall progress</span>
              <span>
                {Math.round(
                  (activeUploads.reduce((sum, u) => sum + u.progress, 0) /
                    (activeCount * 100)) *
                    100,
                )}
                %
              </span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all duration-300',
                  hasFailed ? 'bg-destructive' : 'bg-primary',
                )}
                style={{
                  width: `${Math.round(
                    (activeUploads.reduce((sum, u) => sum + u.progress, 0) /
                      (activeCount * 100)) *
                      100,
                  )}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
