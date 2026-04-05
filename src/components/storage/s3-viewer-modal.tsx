import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { S3BucketViewer } from './s3-bucket-viewer'

type S3ViewerModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  bucketName?: string | null
}

export function S3ViewerModal({
  open,
  onOpenChange,
  bucketName,
}: S3ViewerModalProps) {
  const [workingBucketName, setWorkingBucketName] = useState(bucketName ?? '')

  useEffect(() => {
    setWorkingBucketName(bucketName ?? '')
  }, [bucketName])

  const normalizedBucketName = workingBucketName.trim()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col h-[85vh] max-w-4xl p-0 gap-0 overflow-hidden bg-background">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-lg font-semibold text-foreground">
            S3 Viewer
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Browse and manage files in your S3 bucket
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col p-6 min-h-0 overflow-hidden">
          {!bucketName ? (
            <div className="mb-4">
              <Input
                value={workingBucketName}
                onChange={(event) => setWorkingBucketName(event.target.value)}
                placeholder="Enter bucket name..."
                className="max-w-md"
              />
            </div>
          ) : null}

          {normalizedBucketName.length >= 3 ? (
            <div className="flex-1 min-h-0 min-w-0 overflow-hidden">
              <S3BucketViewer bucketName={normalizedBucketName} />
            </div>
          ) : (
            <div className="text-muted-foreground rounded-lg border border-dashed flex-1 flex items-center justify-center p-6 text-sm">
              Enter a bucket name to open viewer.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
