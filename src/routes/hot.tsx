import * as React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QrCode, RefreshCcw } from 'lucide-react'
import * as QRCode from 'qrcode'
import { Button } from '@/components/ui/button'
import { CURRENT_USER_QUERY_KEY } from '@/lib/auth/current-user'
import { isNotAuthenticatedMiddleware } from '@/middlewares/isNotAuthenticated'
import { createQrOffer, pollQrStatus } from './-hot-qr-server'
import type { OfferResponse, PollResponse } from './-hot-qr-server'

/** Each QR is shown for one minute, then the user must generate a new one. */
const QR_LIFETIME_MS = 60_000

/** Poll results after which the offer can never change again. */
const TERMINAL_STATUSES = new Set<PollResponse['status']>([
  'approved',
  'expired',
  'rejected',
  'not_found',
])

export const Route = createFileRoute('/hot')({
  component: HotRoute,
  server: {
    middleware: [isNotAuthenticatedMiddleware],
  },
})

type QrOffer = { offer: OfferResponse; qrImage: string }

/** Creates a login offer on the server and renders it as a QR image. */
function useCreateQrOffer() {
  return useMutation({
    mutationFn: async (): Promise<QrOffer> => {
      const result = await createQrOffer()
      if (!result.success) throw new Error(result.error)
      const qrImage = await QRCode.toDataURL(result.data.payload, {
        width: 260,
        margin: 1,
      })
      return { offer: result.data, qrImage }
    },
  })
}

/** Polls an offer until it reaches a terminal status or `enabled` turns false. */
function usePollQrStatus(offer: OfferResponse | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ['pollQrStatus', offer?.pollKey],
    queryFn: async () => {
      if (!offer) return null
      const result = await pollQrStatus({ data: { pollKey: offer.pollKey } })
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    enabled: enabled && Boolean(offer),
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status && TERMINAL_STATUSES.has(status)) return false
      return offer?.pollIntervalMs ?? 5000
    },
    retry: false,
  })
}

/** Marks the offer as expired once its one-minute window has passed. */
function useQrExpiry(pollKey: string | undefined) {
  const [expiredPollKey, setExpiredPollKey] = React.useState<string>()

  React.useEffect(() => {
    if (!pollKey) return
    const timer = setTimeout(() => setExpiredPollKey(pollKey), QR_LIFETIME_MS)
    return () => clearTimeout(timer)
  }, [pollKey])

  return pollKey !== undefined && expiredPollKey === pollKey
}

/** "Scan-based login": shows a QR that a signed-in device scans to grant this browser a tiny session. */
function HotRoute() {
  const navigate = Route.useNavigate()
  const queryClient = useQueryClient()
  const createOffer = useCreateQrOffer()
  // A failed (or in-flight) regenerate clears `data`, so the old offer stops polling.
  const offer = createOffer.data?.offer
  const expired = useQrExpiry(offer?.pollKey)
  const poll = usePollQrStatus(offer, !expired)
  const status = poll.data?.status

  // Generate the first QR once, even under StrictMode's double effects.
  const requestedRef = React.useRef(false)
  const { mutate: generateQr } = createOffer
  React.useEffect(() => {
    if (requestedRef.current) return
    requestedRef.current = true
    generateQr()
  }, [generateQr])

  // Approved: the poll response set the session cookie. Drop the cached
  // "anonymous" user so the app layout loads the new session.
  React.useEffect(() => {
    if (status !== 'approved') return
    queryClient.removeQueries({ queryKey: CURRENT_USER_QUERY_KEY })
    void navigate({ to: '/' })
  }, [status, queryClient, navigate])

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
          {createOffer.data ? (
            <img
              src={createOffer.data.qrImage}
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

        <p className="text-sm">
          {describeState(createOffer, expired, poll.isLoading, poll.data)}
        </p>
        {expired && (
          <p className="text-sm font-medium text-amber-600">
            QR has expired - generate new QR.
          </p>
        )}

        <div className="flex gap-2">
          <Button onClick={() => generateQr()} disabled={createOffer.isPending}>
            <RefreshCcw className="size-4" />
            {createOffer.isPending ? 'Generating...' : 'Generate new QR'}
          </Button>
          <Button asChild variant="ghost">
            <Link to="/auth">Back to login</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

function describeState(
  createOffer: ReturnType<typeof useCreateQrOffer>,
  expired: boolean,
  isFirstPoll: boolean,
  pollResult: PollResponse | null | undefined,
): string {
  if (createOffer.isPending) return 'Generating QR...'
  if (createOffer.isError) {
    return createOffer.error.message || 'Failed to generate QR offer.'
  }
  if (!createOffer.isSuccess) return 'Generate a QR to start a tiny session.'
  if (expired) return 'QR has expired - generate new QR.'
  if (isFirstPoll) return 'Scan-based login ready. Processing...'
  if (pollResult?.status === 'claimed') {
    return 'QR scanned. Finalizing tiny session...'
  }
  if (
    pollResult?.status === 'expired' ||
    pollResult?.status === 'rejected' ||
    pollResult?.status === 'not_found'
  ) {
    return pollResult.message ?? 'QR has expired - generate new QR.'
  }
  return 'Scan-based login ready. Tiny session lasts 10 minutes.'
}
