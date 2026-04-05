import * as React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { QrCode, RefreshCcw } from 'lucide-react'
import QRCode from 'qrcode'
import { Button } from '@/components/ui/button'

type OfferResponse = {
  code: string
  pollKey: string
  payload: string
  expiresAt: string
  pollIntervalMs: number
}

type PollResponse = {
  status:
    | 'pending'
    | 'claimed'
    | 'approved'
    | 'expired'
    | 'rejected'
    | 'not_found'
  message?: string
  tinySessionExpiresAt?: string
}

const ONE_MINUTE_MS = 60_000

export const Route = createFileRoute('/hot')({
  component: HotRoute,
})

function HotRoute() {
  const [qrImage, setQrImage] = React.useState('')
  const [offer, setOffer] = React.useState<OfferResponse | null>(null)
  const [stateMessage, setStateMessage] = React.useState(
    'Generate a QR to start a tiny session.',
  )
  const [loading, setLoading] = React.useState(false)
  const [expired, setExpired] = React.useState(false)

  const generateQr = React.useCallback(async () => {
    setLoading(true)
    setExpired(false)
    setStateMessage('Generating QR...')
    try {
      const response = await fetch('/api/qr-auth/create-offer', {
        method: 'POST',
      })
      const data = (await response.json())
      const resData = data as any;
      if (!response.ok || !resData.payload) {
        throw new Error(
          (data as { error?: string }).error ?? 'Failed to generate QR offer.',
        )
      }

      const dataUrl = await QRCode.toDataURL(resData.payload as string, {
        width: 260,
        margin: 1,
      })

      setOffer(resData as any)
      setQrImage(dataUrl as any)
      setStateMessage('Scan-based login ready. Tiny session lasts 10 minutes.')
    } catch (error) {
      setOffer(null)
      setQrImage('')
      setStateMessage(
        error instanceof Error ? error.message : 'Failed to generate QR offer.',
      )
      setExpired(true)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void generateQr()
  }, [generateQr])

  React.useEffect(() => {
    if (!offer || expired) return

    let cancelled = false
    const startedAt = Date.now()

    const poll = async () => {
      if (cancelled) return

      if (Date.now() - startedAt >= ONE_MINUTE_MS) {
        setExpired(true)
        setStateMessage('QR has expired - generate new QR.')
        return
      }

      try {
        const response = await fetch(
          `/api/qr-auth/poll?pollKey=${encodeURIComponent(offer.pollKey)}`,
        )
        const data = (await response
          .json()
          .catch(() => null)) as PollResponse | null
        if (!response.ok || !data) {
          return
        }

        if (data.status === 'approved') {
          setStateMessage('Tiny session approved. Redirecting...')
          window.location.href = '/'
          return
        }

        if (data.status === 'claimed') {
          setStateMessage('QR scanned. Finalizing tiny session...')
          return
        }

        if (
          data.status === 'expired' ||
          data.status === 'rejected' ||
          data.status === 'not_found'
        ) {
          setExpired(true)
          setStateMessage(data.message ?? 'QR has expired - generate new QR.')
        }
      } catch {
        // Keep polling in case of transient errors.
      }
    }

    void poll()
    const timer = window.setInterval(() => {
      void poll()
    }, offer.pollIntervalMs ?? 5000)

    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [offer, expired])

  return (
    <div className="bg-background flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4 rounded-lg border p-6">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">QR login</h1>
          <p className="text-muted-foreground text-sm">
            Tiny session: 10-minute window. This QR itself refreshes every 1
            minute.
          </p>
        </div>

        <div className="rounded-lg border p-4">
          {qrImage ? (
            <img
              src={qrImage}
              alt="QR login code"
              className="mx-auto h-64 w-64 rounded-md"
            />
          ) : (
            <div className="text-muted-foreground flex h-64 items-center justify-center text-sm">
              <QrCode className="mr-2 size-4" />
              No QR generated yet
            </div>
          )}
        </div>

        <p className="text-sm">{stateMessage}</p>
        {expired && (
          <p className="text-sm font-medium text-amber-600">
            QR has expired - generate new QR.
          </p>
        )}

        <div className="flex gap-2">
          <Button onClick={() => void generateQr()} disabled={loading}>
            <RefreshCcw className="size-4" />
            {loading ? 'Generating...' : 'Generate new QR'}
          </Button>
          <Button asChild variant="ghost">
            <Link to="/auth/login">Back to login</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
