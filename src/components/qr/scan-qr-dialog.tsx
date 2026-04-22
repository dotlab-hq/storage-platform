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
import { useQrScanner } from './scan-qr/use-qr-scanner'
import { SCAN_QR_INTRO_SEEN_KEY } from './scan-qr/utils'

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

  const {
    state,
    permission,
    setPermission,

    cameraError,
    regionId,
    handleInvalidQr,
    submitScan,
    parsedCode,
    reset,
  } = useQrScanner(open, setOpen)

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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan a Login QR Code</DialogTitle>
            <DialogDescription>
              Use another device to generate a QR code from the /hot page, then
              scan it.
            </DialogDescription>
          </DialogHeader>
          <div className="my-8 flex justify-center text-muted-foreground p-6 bg-muted/30 rounded-lg">
            <Camera className="size-16 animate-pulse" />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIntroOpen(false)}>
              Cancel
            </Button>
            <Button onClick={startAfterIntro}>Open Camera</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) void reset()
          setOpen(isOpen)
        }}
      >
        <DialogContent
          className="sm:max-w-md max-h-[100dvh] overflow-y-auto"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Scan QR Code</DialogTitle>
            <DialogDescription>
              {state === 'scanning' &&
                'Point your camera at a login QR code...'}
              {state === 'review' && 'Review the scanned QR code below...'}
            </DialogDescription>
          </DialogHeader>

          {state === 'scanning' && (
            <div className="relative aspect-square w-full max-w-[300px] overflow-hidden rounded-lg mx-auto bg-black border">
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
              {parsedCode ? (
                <div className="p-4 border rounded-md bg-green-50/50 dark:bg-green-950/20">
                  <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">
                    Valid QR Code Detected
                  </p>
                  <p className="text-xs text-muted-foreground font-mono break-all">
                    {parsedCode.slice(0, 16)}...
                  </p>
                </div>
              ) : (
                <div className="p-4 border rounded-md bg-red-50/50 dark:bg-red-950/20">
                  <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-1">
                    Invalid QR Code
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    This doesn't look like a valid dot-storage login code.
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

              {parsedCode && (
                <div className="space-y-3 pt-2">
                  <div className="text-sm font-medium">Session Permissions</div>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-start gap-3 rounded-md border p-3 cursor-pointer hover:bg-muted/50">
                      <input
                        type="radio"
                        name="qr-permission"
                        value="read"
                        checked={permission === 'read'}
                        onChange={() => setPermission('read')}
                        className="mt-1"
                      />
                      <div>
                        <div className="text-sm font-medium">Read Only</div>
                        <div className="text-xs text-muted-foreground">
                          Can only view files and storage.
                        </div>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 rounded-md border p-3 cursor-pointer hover:bg-muted/50">
                      <input
                        type="radio"
                        name="qr-permission"
                        value="read-write"
                        checked={permission === 'read-write'}
                        onChange={() => setPermission('read-write')}
                        className="mt-1"
                      />
                      <div>
                        <div className="text-sm font-medium">Full Access</div>
                        <div className="text-xs text-muted-foreground">
                          Can view, upload, rename, and delete files.
                        </div>
                      </div>
                    </label>
                  </div>
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
            {state !== 'scanning' && parsedCode && (
              <Button
                onClick={() => void submitScan()}
                disabled={state === 'submitting'}
                className="w-full sm:w-auto"
              >
                {state === 'submitting' ? 'Approving...' : 'Approve session'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
