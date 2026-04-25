import { useEffect, useRef, useState } from 'react'
import { Check, Copy, Loader2, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from '@/components/ui/sonner'
import type { S3BucketCredentials } from '@/types/s3-buckets'
import { DEFAULT_ASSETS_BUCKET_NAME } from '@/lib/storage/assets-bucket'

type BucketCredentialsDialogProps = {
  bucketName: string | null
  credentials: S3BucketCredentials | undefined
  onOpenChange: (open: boolean) => void
  onCopy: (value: string) => Promise<void>
  onRotate?: (() => Promise<S3BucketCredentials | null>) | undefined
}

export function BucketCredentialsDialog(props: BucketCredentialsDialogProps) {
  const { bucketName, credentials, onOpenChange, onCopy, onRotate } = props
  const [copiedField, setCopiedField] = useState<'access' | 'secret' | null>(
    null,
  )
  const copyResetTimerRef = useRef<number | null>(null)
  const [isRotating, setIsRotating] = useState(false)

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
            {onRotate && (
              <DialogFooter className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const confirmed = window.confirm(
                      'Rotating credentials will invalidate the current access key and secret. Are you sure you want to continue?',
                    )
                    if (!confirmed) return
                    setIsRotating(true)
                    try {
                      const result = await onRotate?.()
                      if (result) {
                        toast.success('Credentials rotated successfully')
                      } else {
                        toast.error('Failed to rotate credentials')
                      }
                    } catch {
                      toast.error('Failed to rotate credentials')
                    } finally {
                      setIsRotating(false)
                    }
                  }}
                  disabled={
                    isRotating || bucketName === DEFAULT_ASSETS_BUCKET_NAME
                  }
                  className="gap-2"
                >
                  {isRotating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <KeyRound className="h-4 w-4" />
                  )}
                  Rotate Credentials
                </Button>
              </DialogFooter>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
