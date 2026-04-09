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
import { useWebrtcScanner } from './use-webrtc-transfer'
import { useWebRTC } from '@/hooks/use-webrtc'
import { WEBRTC_TRANSFER_PREFIX } from '@/lib/webrtc-transfer-utils'

type Html5QrScanner = {
  start: (
    deviceId: unknown,
    config: unknown,
    onSuccess: (text: string) => void,
    onError: (error: string) => void,
  ) => Promise<void>
  stop: () => Promise<void>
  clear: () => void
}

async function startScannerWithFallback(
  scanner: Html5QrScanner,
  onSuccess: (text: string) => void,
) {
  const config = { fps: 10, qrbox: { width: 220, height: 220 } }

  try {
    await scanner.start(
      { facingMode: { exact: 'environment' } },
      config,
      onSuccess,
      () => {},
    )
    return
  } catch {
    // fallback
  }

  try {
    await scanner.start({ facingMode: 'user' }, config, onSuccess, () => {})
    return
  } catch {
    // fallback
  }

  const { Html5Qrcode } = await import('html5-qrcode')
  const cameras = await Html5Qrcode.getCameras()
  if (cameras.length === 0) {
    throw new Error('No camera detected.')
  }
  await scanner.start(cameras[0].id, config, onSuccess, () => {})
}

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
  const [state, setState] = React.useState<
    'idle' | 'scanning' | 'review' | 'submitting'
  >('idle')
  const [decodedPayload, setDecodedPayload] = React.useState('')
  const [cameraError, setCameraError] = React.useState('')
  const scannerRef = React.useRef<Html5QrScanner | null>(null)
  const regionId = React.useId().replace(/:/g, '')

  const {
    submitMutation,
    error: submitError,
    connectionStatus,
    sessionToken,
  } = useWebrtcScanner()
  const { startConnection } = useWebRTC()

  React.useEffect(() => {
    if (sessionToken && connectionStatus === 'claimed') {
      startConnection(sessionToken, 'answerer')
    }
  }, [sessionToken, connectionStatus, startConnection])

  const stopScanner = React.useCallback(async () => {
    const scanner = scannerRef.current
    if (!scanner) return
    try {
      await scanner.stop()
    } catch {
      // no-op
    }
    try {
      scanner.clear()
    } catch {
      // no-op
    }
    scannerRef.current = null
  }, [])

  const reset = React.useCallback(async () => {
    await stopScanner()
    setDecodedPayload('')
    setCameraError('')
    setState('idle')
  }, [stopScanner])

  React.useEffect(() => {
    if (!open) {
      void reset()
      return
    }

    let cancelled = false

    const start = async () => {
      try {
        setState('scanning')
        setCameraError('')
        const { Html5Qrcode } = await import('html5-qrcode')
        const scanner = new Html5Qrcode(regionId) as unknown as Html5QrScanner
        scannerRef.current = scanner

        await startScannerWithFallback(scanner, (text) => {
          if (cancelled) return
          setDecodedPayload(text)
          setState('review')
          void stopScanner()
        })
      } catch (error) {
        if (cancelled) return
        setState('idle')
        setCameraError(
          error instanceof Error ? error.message : 'Unable to start camera.',
        )
      }
    }

    void start()
    return () => {
      cancelled = true
      void stopScanner()
    }
  }, [open, regionId, stopScanner])

  const handleInvalidQr = async () => {
    setDecodedPayload('')
    setState('scanning')
    setCameraError('')
    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      const scanner = new Html5Qrcode(regionId) as unknown as Html5QrScanner
      scannerRef.current = scanner

      await startScannerWithFallback(scanner, (text) => {
        setDecodedPayload(text)
        setState('review')
        void stopScanner()
      })
    } catch (error) {
      setState('idle')
      setCameraError(
        error instanceof Error ? error.message : 'Unable to restart camera.',
      )
    }
  }

  const handleSubmit = () => {
    if (!decodedPayload) return
    setState('submitting')
    submitMutation.mutate(decodedPayload)
  }

  const isValidWebrtcPayload = decodedPayload.startsWith(WEBRTC_TRANSFER_PREFIX)

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

      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) void reset()
          setOpen(isOpen)
        }}
      >
        <DialogContent
          className="sm:max-w-md max-h-dvh overflow-y-auto"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Scan WebRTC QR Code</DialogTitle>
            <DialogDescription>
              {state === 'scanning' &&
                'Point your camera at a WebRTC transfer QR code...'}
              {state === 'review' && 'Review the scanned QR code...'}
              {(state === 'submitting' || submitMutation.isPending) &&
                'Connecting to peer...'}
            </DialogDescription>
          </DialogHeader>

          {state === 'scanning' && (
            <div className="relative aspect-square w-full max-w-75 overflow-hidden rounded-lg mx-auto bg-black border">
              <div id={regionId} className="h-full w-full" />
              {cameraError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 px-4 text-center text-sm text-red-500">
                  {cameraError}
                </div>
              )}
            </div>
          )}

          {(state === 'review' || state === 'submitting') && (
            <div className="space-y-4">
              {isValidWebrtcPayload ? (
                <div className="p-4 border rounded-md bg-green-50/50 dark:bg-green-950/20">
                  <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">
                    Valid WebRTC Transfer QR Code
                  </p>
                  <p className="text-xs text-muted-foreground font-mono break-all">
                    {decodedPayload
                      .slice(WEBRTC_TRANSFER_PREFIX.length)
                      .slice(0, 16)}
                    ...
                  </p>
                </div>
              ) : (
                <div className="p-4 border rounded-md bg-red-50/50 dark:bg-red-950/20">
                  <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-1">
                    Invalid QR Code
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    This doesn't look like a WebRTC transfer QR code.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleInvalidQr}
                    className="w-full"
                  >
                    <RefreshCcw className="size-4 mr-2" />
                    Scan again
                  </Button>
                </div>
              )}

              {submitError && (
                <div className="p-4 border rounded-md bg-red-50/50 dark:bg-red-950/20">
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">
                    {submitError}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-2">
            <Button
              variant="secondary"
              onClick={() => setOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            {state === 'review' && isValidWebrtcPayload && (
              <Button
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
                className="w-full sm:w-auto"
              >
                {submitMutation.isPending ? 'Connecting...' : 'Connect'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
