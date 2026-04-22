import { useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { S3BucketCredentials } from '@/types/s3-buckets'

type BucketCredentialsDialogProps = {
  bucketName: string | null
  credentials: S3BucketCredentials | undefined
  onOpenChange: (open: boolean) => void
  onCopy: (value: string) => Promise<void>
}

export function BucketCredentialsDialog(props: BucketCredentialsDialogProps) {
  const { bucketName, credentials, onOpenChange, onCopy } = props
  const [copiedField, setCopiedField] = useState<'access' | 'secret' | null>(
    null,
  )
  const copyResetTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (copyResetTimerRef.current !== null) {
        window.clearTimeout(copyResetTimerRef.current)
      }
    }
  }, [])

  const handleCopy = async (field: 'access' | 'secret', value: string) => {
    await onCopy(value)
    setCopiedField(field)

    if (copyResetTimerRef.current !== null) {
      window.clearTimeout(copyResetTimerRef.current)
    }

    copyResetTimerRef.current = window.setTimeout(() => {
      setCopiedField(null)
      copyResetTimerRef.current = null
    }, 1400)
  }

  return (
    <Dialog open={bucketName !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bucket Credentials</DialogTitle>
          <DialogDescription>
            {bucketName ? `Virtual bucket: ${bucketName}` : ''}
          </DialogDescription>
        </DialogHeader>
        {credentials && (
          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <p className="text-muted-foreground">Access Key ID</p>
              <div className="flex items-start gap-2">
                <p className="min-w-0 flex-1 break-all rounded-md border bg-muted/30 px-2 py-1 font-mono leading-5">
                  {credentials.accessKeyId}
                </p>
                <Button
                  size="icon-xs"
                  variant="ghost"
                  onClick={() =>
                    void handleCopy('access', credentials.accessKeyId)
                  }
                >
                  {copiedField === 'access' ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <p
                className={`text-[11px] transition-all duration-200 ${copiedField === 'access' ? 'translate-y-0 opacity-100 text-emerald-600' : '-translate-y-1 opacity-0'}`}
              >
                Copied to clipboard
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Secret Access Key</p>
              <div className="flex items-start gap-2">
                <p className="min-w-0 flex-1 break-all rounded-md border bg-muted/30 px-2 py-1 font-mono leading-5">
                  {credentials.secretAccessKey}
                </p>
                <Button
                  size="icon-xs"
                  variant="ghost"
                  onClick={() =>
                    void handleCopy('secret', credentials.secretAccessKey)
                  }
                >
                  {copiedField === 'secret' ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <p
                className={`text-[11px] transition-all duration-200 ${copiedField === 'secret' ? 'translate-y-0 opacity-100 text-emerald-600' : '-translate-y-1 opacity-0'}`}
              >
                Copied to clipboard
              </p>
            </div>
            <p className="text-muted-foreground">
              Bucket: {credentials.bucket}
            </p>
            <p className="text-muted-foreground">
              S3 Endpoint: {credentials.endpoint}
            </p>
            <p className="text-muted-foreground">
              Region: {credentials.region}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
