import { useEffect, useRef, useState } from 'react'
import { Check, Copy, Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from '@/components/ui/sonner'
import type { S3BucketCredentials } from '@/types/s3-buckets'
import { DEFAULT_ASSETS_BUCKET_NAME } from '@/lib/storage/assets-bucket'
import { ConfirmActionDialog } from '@/components/ui/confirm-action-dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

type BucketCredentialsContentProps = {
  bucketName: string | null
  credentials: S3BucketCredentials | undefined
  onCopy: (value: string) => Promise<void>
  onRotate?: (() => Promise<S3BucketCredentials | null>) | undefined
}

export function BucketCredentialsContent({
  bucketName,
  credentials,
  onCopy,
  onRotate,
}: BucketCredentialsContentProps) {
  const [copiedField, setCopiedField] = useState<'access' | 'secret' | null>(
    null,
  )
  const [showSecret, setShowSecret] = useState(false)
  const copyResetTimerRef = useRef<number | null>(null)
  const [isRotating, setIsRotating] = useState(false)
  const [confirmRotateOpen, setConfirmRotateOpen] = useState(false)

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
    toast.success('Copied to clipboard')

    if (copyResetTimerRef.current !== null) {
      window.clearTimeout(copyResetTimerRef.current)
    }

    copyResetTimerRef.current = window.setTimeout(() => {
      setCopiedField(null)
      copyResetTimerRef.current = null
    }, 1400)
  }

  const maskedSecret = credentials?.secretAccessKey
    ? credentials.secretAccessKey.replace(/./g, '•')
    : ''
  const isDefaultAssets = bucketName === DEFAULT_ASSETS_BUCKET_NAME

  return (
    <>
      <DialogHeader className="text-left">
        <DialogTitle>Bucket Credentials</DialogTitle>
        <DialogDescription>
          {bucketName ? `Virtual bucket: ${bucketName}` : ''}
        </DialogDescription>
      </DialogHeader>
      {bucketName && (
        <Badge className="w-fit bg-muted/40 text-foreground">
          {bucketName}
        </Badge>
      )}
      {credentials && (
        <div className="space-y-3 text-xs">
          <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Access Key ID
                  </p>
                  <p className="mt-1 break-all rounded-md border border-border/60 bg-background/60 px-2 py-1 font-mono text-xs">
                    {credentials.accessKeyId}
                  </p>
                </div>
                <Button
                  size="icon-sm"
                  variant="outline"
                  onClick={() =>
                    void handleCopy('access', credentials.accessKeyId)
                  }
                  className="border-border/60 text-foreground hover:bg-muted/60"
                >
                  {copiedField === 'access' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Secret Access Key
                  </p>
                  <p className="mt-1 break-all rounded-md border border-border/60 bg-background/60 px-2 py-1 font-mono text-xs">
                    {showSecret
                      ? credentials.secretAccessKey
                      : maskedSecret}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    size="icon-sm"
                    variant="outline"
                    onClick={() =>
                      void handleCopy('secret', credentials.secretAccessKey)
                    }
                    className="border-border/60 text-foreground hover:bg-muted/60"
                  >
                    {copiedField === 'secret' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="outline"
                    onClick={() => setShowSecret((prev) => !prev)}
                    className="border-border/60 text-foreground hover:bg-muted/60"
                  >
                    {showSecret ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="grid gap-2 text-muted-foreground">
            <p>
              <span className="text-foreground">Bucket:</span>{' '}
              {credentials.bucket}
            </p>
            <p>
              <span className="text-foreground">S3 Endpoint:</span>{' '}
              {credentials.endpoint}
            </p>
            <p>
              <span className="text-foreground">Region:</span>{' '}
              {credentials.region}
            </p>
          </div>
          {onRotate && (
            <DialogFooter className="pt-2">
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setConfirmRotateOpen(true)}
                        disabled={isRotating || isDefaultAssets}
                        className="gap-2 border-border/60 text-foreground hover:bg-muted/60"
                      >
                        {isRotating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <KeyRound className="h-4 w-4" />
                        )}
                        Rotate Credentials
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {isDefaultAssets && (
                    <TooltipContent>
                      Default assets bucket credentials cannot be rotated
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </DialogFooter>
          )}
        </div>
      )}

      <ConfirmActionDialog
        open={confirmRotateOpen}
        onOpenChange={setConfirmRotateOpen}
        title="Rotate credentials?"
        description="This will invalidate the current access key and secret. Applications must be updated immediately."
        confirmLabel="Rotate credentials"
        confirmVariant="warning"
        requiresConfirmation
        onConfirm={async () => {
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
            setConfirmRotateOpen(false)
          }
        }}
        isLoading={isRotating}
      />
    </>
  )
}
