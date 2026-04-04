import * as React from 'react'
import { Camera, QrCode, RefreshCcw } from 'lucide-react'
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

type Permission = 'read' | 'read-write'

type Html5QrScanner = {
  start: (
    cameraIdOrConfig: string | MediaTrackConstraints,
    configuration?: {
      fps?: number
      qrbox?: { width: number; height: number }
    },
    qrCodeSuccessCallback?: (decodedText: string) => void,
    qrCodeErrorCallback?: (errorMessage: string) => void,
  ) => Promise<unknown>
  stop: () => Promise<void>
  clear: () => void
}

type ScanState = 'idle' | 'scanning' | 'review' | 'submitting'
const SCAN_QR_INTRO_SEEN_KEY = 'dot_storage_scan_qr_intro_seen_v1'

async function startScannerWithFallback(
  scanner: Html5QrScanner,
  onSuccess: (decodedText: string) => void,
) {
  const config = { fps: 10, qrbox: { width: 220, height: 220 } }
  const onError = () => {
    // Ignore frame decode misses.
  }

  try {
    await scanner.start(
      { facingMode: { exact: 'environment' } },
      config,
      onSuccess,
      onError,
    )
    return
  } catch {
    // fallback
  }

  try {
    await scanner.start({ facingMode: 'user' }, config, onSuccess, onError)
    return
  } catch {
    // fallback
  }

  const { Html5Qrcode } = await import('html5-qrcode')
  const cameras = await Html5Qrcode.getCameras()
  if (cameras.length === 0) {
    throw new Error('No camera detected.')
  }
  await scanner.start(cameras[0].id, config, onSuccess, onError)
}

export function ScanQrDialog({
  triggerLabel = 'Scan now',
  triggerVariant = 'outline',
  className,
}: {
  triggerLabel?: string
  triggerVariant?: React.ComponentProps<typeof Button>['variant']
  className?: string
}) {
  const [open, setOpen] = React.useState(false)
  const [introOpen, setIntroOpen] = React.useState(false)
  const [state, setState] = React.useState<ScanState>('idle')
  const [permission, setPermission] = React.useState<Permission>('read')
  const [decodedPayload, setDecodedPayload] = React.useState<string>('')
  const [cameraError, setCameraError] = React.useState<string>('')
  const scannerRef = React.useRef<{
    stop: () => Promise<void>
    clear: () => void
  } | null>(null)
  const regionId = React.useId().replace(/:/g, '')

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
    setPermission('read')
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
  }, [open, regionId, reset, stopScanner])

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

  const submitScan = async () => {
    if (!decodedPayload) {
      toast.error('No QR payload scanned yet.')
      return
    }
    setState('submitting')
    try {
      const response = await fetch('/api/qr-auth/scan', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          payload: decodedPayload,
          requestedPermission: permission,
        }),
      })
      const data = (await response.json().catch(() => null)) as {
        error?: string
      } | null

      if (!response.ok) {
        throw new Error(data?.error ?? 'QR scan request failed.')
      }

      toast.success(
        'QR is valid. Session claim sent. Keep the /hot screen open to finish login.',
      )
      setOpen(false)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to claim QR.',
      )
      setState('review')
    }
  }

  const parsedCode = React.useMemo(() => {
    const prefix = 'DOT_STORAGE_QR_LOGIN:'
    if (!decodedPayload.startsWith(prefix)) {
      return null
    }
    return decodedPayload.slice(prefix.length)
  }, [decodedPayload])

  const openScanner = () => {
    if (typeof window === 'undefined') {
      setOpen(true)
      return
    }

    const hasSeenIntro =
      window.localStorage.getItem(SCAN_QR_INTRO_SEEN_KEY) === '1'
    if (hasSeenIntro) {
      setOpen(true)
      return
    }

    setIntroOpen(true)
  }

  const startAfterIntro = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SCAN_QR_INTRO_SEEN_KEY, '1')
    }
    setIntroOpen(false)
    setOpen(true)
  }

  return (
    <>
      <Button
        variant={triggerVariant}
        className={className}
        onClick={openScanner}
      >
        <QrCode className="size-4" />
        {triggerLabel}
      </Button>
      <Dialog open={introOpen} onOpenChange={setIntroOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scan-based login</DialogTitle>
            <DialogDescription>
              Point your camera at a login QR from the /hot page. Then confirm
              access level and submit.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border p-3 text-sm text-muted-foreground">
            Tiny sessions last 10 minutes. Use read-only unless you explicitly
            need write access.
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIntroOpen(false)}>
              Cancel
            </Button>
            <Button onClick={startAfterIntro}>Got it, start scan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scan QR</DialogTitle>
            <DialogDescription>
              Camera opens rear-first, then front fallback. After scan, confirm
              if QR is valid and choose read or read-write access.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {state !== 'review' && (
              <div className="rounded-md border p-2">
                <div
                  id={regionId}
                  className="min-h-[250px] w-full overflow-hidden rounded-sm"
                />
              </div>
            )}

            {state === 'scanning' && (
              <p className="text-muted-foreground flex items-center gap-2 text-sm">
                <Camera className="size-4" />
                Point camera at QR code...
              </p>
            )}

            {cameraError && (
              <p className="text-sm text-red-600">{cameraError}</p>
            )}

            {state === 'review' && (
              <div className="space-y-3 rounded-md border p-3">
                <p className="text-sm font-medium">Is this QR valid?</p>
                <div className="rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                  {parsedCode
                    ? `Detected offer: ${parsedCode}`
                    : 'QR detected and ready to submit.'}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void handleInvalidQr()}
                  >
                    <RefreshCcw className="size-4" />
                    Scan QR again
                  </Button>
                  <Button size="sm" onClick={() => void submitScan()}>
                    Yes, continue
                  </Button>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Access</p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={permission === 'read' ? 'default' : 'outline'}
                      onClick={() => setPermission('read')}
                    >
                      Read access
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={
                        permission === 'read-write' ? 'default' : 'outline'
                      }
                      onClick={() => setPermission('read-write')}
                    >
                      Read + write
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={state === 'submitting'}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
