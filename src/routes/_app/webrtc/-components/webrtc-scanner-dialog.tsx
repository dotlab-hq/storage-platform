import * as React from 'react'
import { RefreshCcw, ScanBarcode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CameraRegion } from '@/components/qr/scan-qr/camera-region'
import { useCameraScanner } from '@/components/qr/scan-qr/use-camera-scanner'
import { WEBRTC_TRANSFER_PREFIX } from '@/lib/webrtc-transfer-utils'
import { useWebrtcScanner } from './use-webrtc-scanner'

/** How long the "connected" confirmation stays up before the dialog closes. */
const CLOSE_AFTER_CLAIM_MS = 1500

/** Button that scans another device's WebRTC QR code and connects to it. */
export function WebRTCScannerDialog({
  triggerLabel = 'Scan Now',
  triggerVariant = 'outline',
  className,
}: {
  triggerLabel?: string
  triggerVariant?: React.ComponentProps<typeof Button>['variant']
  className?: string
}) {
  const [open, setOpen] = React.useState(false)
  const close = React.useCallback(() => setOpen(false), [])

  return (
    <>
      <Button
        variant={triggerVariant}
        className={className}
        onClick={() => setOpen(true)}
      >
        <ScanBarcode className="size-4" />
        {triggerLabel}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-h-dvh overflow-y-auto sm:max-w-md"
          onInteractOutside={(event) => event.preventDefault()}
        >
          {/* Mounted only while open, so closing stops the camera and resets. */}
          <WebrtcQrScanner onClose={close} />
        </DialogContent>
      </Dialog>
    </>
  )
}

function WebrtcQrScanner({ onClose }: { onClose: () => void }) {
  const camera = useCameraScanner()
  const claim = useWebrtcScanner()
  const payload = camera.decodedText
  const isValidPayload = payload.startsWith(WEBRTC_TRANSFER_PREFIX)

  React.useEffect(() => {
    if (!claim.isSuccess) return
    const timer = setTimeout(onClose, CLOSE_AFTER_CLAIM_MS)
    return () => clearTimeout(timer)
  }, [claim.isSuccess, onClose])

  return (
    <>
      <DialogHeader>
        <DialogTitle>Scan WebRTC QR Code</DialogTitle>
        <DialogDescription>
          {describeStep(Boolean(payload), claim.isPending)}
        </DialogDescription>
      </DialogHeader>

      {!payload ? (
        <CameraRegion
          regionId={camera.regionId}
          cameraError={camera.cameraError}
        />
      ) : (
        <div className="space-y-4">
          {isValidPayload ? (
            <div className="rounded-md border bg-green-50/50 p-4 dark:bg-green-950/20">
              <p className="mb-1 text-sm font-medium text-green-700 dark:text-green-400">
                {claim.isSuccess
                  ? 'Connected. Starting peer connection...'
                  : 'Valid WebRTC Transfer QR Code'}
              </p>
              <p className="text-muted-foreground font-mono text-xs break-all">
                {payload.slice(WEBRTC_TRANSFER_PREFIX.length).slice(0, 16)}...
              </p>
            </div>
          ) : (
            <div className="rounded-md border bg-red-50/50 p-4 dark:bg-red-950/20">
              <p className="mb-1 text-sm font-medium text-red-700 dark:text-red-400">
                Invalid QR Code
              </p>
              <p className="text-muted-foreground mb-3 text-xs">
                This doesn't look like a WebRTC transfer QR code.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={camera.rescan}
                className="w-full"
              >
                <RefreshCcw className="mr-2 size-4" />
                Scan again
              </Button>
            </div>
          )}

          {claim.error && (
            <div className="rounded-md border bg-red-50/50 p-4 dark:bg-red-950/20">
              <p className="text-sm font-medium text-red-700 dark:text-red-400">
                {claim.error.message}
              </p>
            </div>
          )}
        </div>
      )}

      <DialogFooter className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Button
          variant="secondary"
          onClick={onClose}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        {isValidPayload && !claim.isSuccess && (
          <Button
            onClick={() => claim.mutate(payload)}
            disabled={claim.isPending}
            className="w-full sm:w-auto"
          >
            {claim.isPending ? 'Connecting...' : 'Connect'}
          </Button>
        )}
      </DialogFooter>
    </>
  )
}

function describeStep(scanned: boolean, connecting: boolean) {
  if (connecting) return 'Connecting to peer...'
  if (scanned) return 'Review the scanned QR code...'
  return 'Point your camera at a WebRTC transfer QR code...'
}
