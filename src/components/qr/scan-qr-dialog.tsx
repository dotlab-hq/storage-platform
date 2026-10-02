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
import { CameraRegion } from './scan-qr/camera-region'
import { SCAN_QR_INTRO_SEEN_KEY } from './scan-qr/utils'
import type { Permission } from './scan-qr/types'

/** Button that scans another device's /hot login QR code and approves its session. */
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

  const openScanner = () => {
    if (window.localStorage.getItem(SCAN_QR_INTRO_SEEN_KEY) === '1') {
      setOpen(true)
    } else {
      setIntroOpen(true)
    }
  }

  const startAfterIntro = () => {
    window.localStorage.setItem(SCAN_QR_INTRO_SEEN_KEY, '1')
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
          <div className="text-muted-foreground bg-muted/30 my-8 flex justify-center rounded-lg p-6">
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-h-[100dvh] overflow-y-auto sm:max-w-md"
          onInteractOutside={(event) => event.preventDefault()}
        >
          {/* Mounted only while open, so closing stops the camera and resets. */}
          <LoginQrScanner onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}

function LoginQrScanner({ onClose }: { onClose: () => void }) {
  const { camera, parsedCode, permission, setPermission, approve } =
    useQrScanner(onClose)
  const scanning = !camera.decodedText

  return (
    <>
      <DialogHeader>
        <DialogTitle>Scan QR Code</DialogTitle>
        <DialogDescription>
          {scanning
            ? 'Point your camera at a login QR code...'
            : 'Review the scanned QR code below...'}
        </DialogDescription>
      </DialogHeader>

      {scanning ? (
        <CameraRegion
          regionId={camera.regionId}
          cameraError={camera.cameraError}
        />
      ) : (
        <div className="space-y-4">
          {parsedCode ? (
            <div className="rounded-md border bg-green-50/50 p-4 dark:bg-green-950/20">
              <p className="mb-1 text-sm font-medium text-green-700 dark:text-green-400">
                Valid QR Code Detected
              </p>
              <p className="text-muted-foreground font-mono text-xs break-all">
                {parsedCode.slice(0, 16)}...
              </p>
            </div>
          ) : (
            <div className="rounded-md border bg-red-50/50 p-4 dark:bg-red-950/20">
              <p className="mb-1 text-sm font-medium text-red-700 dark:text-red-400">
                Invalid QR Code
              </p>
              <p className="text-muted-foreground mb-3 text-xs">
                This doesn't look like a valid dot-storage login code.
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

          {parsedCode && (
            <PermissionPicker value={permission} onChange={setPermission} />
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
        {parsedCode && (
          <Button
            onClick={() => approve.mutate()}
            disabled={approve.isPending}
            className="w-full sm:w-auto"
          >
            {approve.isPending ? 'Approving...' : 'Approve session'}
          </Button>
        )}
      </DialogFooter>
    </>
  )
}

const PERMISSION_OPTIONS: {
  value: Permission
  label: string
  description: string
}[] = [
  {
    value: 'read',
    label: 'Read Only',
    description: 'Can only view files and storage.',
  },
  {
    value: 'read-write',
    label: 'Full Access',
    description: 'Can view, upload, rename, and delete files.',
  },
]

function PermissionPicker({
  value,
  onChange,
}: {
  value: Permission
  onChange: (permission: Permission) => void
}) {
  return (
    <div className="space-y-3 pt-2">
      <div className="text-sm font-medium">Session Permissions</div>
      <div className="flex flex-col gap-2">
        {PERMISSION_OPTIONS.map((option) => (
          <label
            key={option.value}
            className="hover:bg-muted/50 flex cursor-pointer items-start gap-3 rounded-md border p-3"
          >
            <input
              type="radio"
              name="qr-permission"
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="mt-1"
            />
            <div>
              <div className="text-sm font-medium">{option.label}</div>
              <div className="text-muted-foreground text-xs">
                {option.description}
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  )
}
