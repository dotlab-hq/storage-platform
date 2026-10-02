import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { S3BucketViewer } from './s3-bucket-viewer'

type S3ViewerModalProps = {
  bucketName: string
  onOpenChange: (open: boolean) => void
}

/**
 * Read-only bucket browser in a dialog. Mounted only while open (by
 * `BucketManagerDialogs`), so the bucket name is always present and folder
 * navigation starts at the root each time.
 */
export function S3ViewerModal({
  bucketName,
  onOpenChange,
}: S3ViewerModalProps) {
  const [prefix, setPrefix] = useState('')

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[94vh] w-[min(98vw,1540px)] max-w-[1540px] flex-col gap-0 overflow-hidden border border-border/60 bg-background/95 p-0 shadow-sm">
        <DialogHeader className="border-b border-border/60 px-6 py-4 text-left">
          <DialogTitle className="text-lg font-semibold text-foreground">
            S3 Viewer
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Browse and manage files in your S3 bucket
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-6">
          <S3BucketViewer
            bucketName={bucketName}
            prefix={prefix}
            onPrefixChange={setPrefix}
            readOnly
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
