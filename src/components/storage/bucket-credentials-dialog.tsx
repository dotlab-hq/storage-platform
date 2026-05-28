import { Dialog, DialogContent } from '@/components/ui/dialog'
import type { S3BucketCredentials } from '@/types/s3-buckets'
import { BucketCredentialsContent } from '@/components/storage/bucket-credentials-content'

type BucketCredentialsDialogProps = {
  bucketName: string | null
  credentials: S3BucketCredentials | undefined
  onOpenChange: (open: boolean) => void
  onCopy: (value: string) => Promise<void>
  onRotate?: (() => Promise<S3BucketCredentials | null>) | undefined
}

export function BucketCredentialsDialog(props: BucketCredentialsDialogProps) {
  const { bucketName, credentials, onOpenChange, onCopy, onRotate } = props
  return (
    <Dialog open={bucketName !== null} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(94vw,32rem)] max-w-[32rem] max-h-[85vh] overflow-y-auto border border-border/60 bg-card shadow-xl">
        <BucketCredentialsContent
          bucketName={bucketName}
          credentials={credentials}
          onCopy={onCopy}
          onRotate={onRotate}
        />
      </DialogContent>
    </Dialog>
  )
}
