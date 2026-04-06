import * as React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { QrCode, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { isNotAuthenticatedMiddleware } from '@/middlewares/isNotAuthenticated'
import {
  useCreateQrOffer,
  usePollQrStatus

} from './hot.server'
import type { OfferResponse } from './hot.server';

const ONE_MINUTE_MS = 60_000

export const Route = createFileRoute( '/hot' )( {
  component: HotRoute,
  server: {
    middleware: [isNotAuthenticatedMiddleware],
  },
} )

function HotRoute() {
  const [expired, setExpired] = React.useState<boolean>( false )
  const startedAtRef = React.useRef<number | null>( null )
  const [currentOffer, setCurrentOffer] = React.useState<OfferResponse | null>(
    null,
  )

  const { qrImage, createOfferMutation } = useCreateQrOffer()

  const { pollResult, isPolling } = usePollQrStatus(
    currentOffer,
    !expired && !( Date.now() - ( startedAtRef.current ?? 0 ) >= ONE_MINUTE_MS ),
  )

  React.useEffect( () => {
    // Generate QR on mount
    void createOfferMutation.mutate()
  }, [] )

  React.useEffect( () => {
    if ( createOfferMutation.isSuccess ) {
      startedAtRef.current = Date.now()
      setExpired( false )
      setCurrentOffer( createOfferMutation.data )
    }
  }, [createOfferMutation.isSuccess, createOfferMutation.data] )

  React.useEffect( () => {
    if ( !startedAtRef.current ) return
    if ( Date.now() - startedAtRef.current >= ONE_MINUTE_MS ) {
      setExpired( true )
    }
  }, [pollResult] )

  React.useEffect( () => {
    if ( pollResult?.status === 'approved' ) {
      window.location.href = '/'
    }
  }, [pollResult?.status] )

  const getStateMessage = (): string => {
    if ( createOfferMutation.isPending ) {
      return 'Generating QR...'
    }
    if ( createOfferMutation.isError ) {
      return (
        createOfferMutation.error.message ?? 'Failed to generate QR offer.'
      )
    }
    if ( !createOfferMutation.isSuccess ) {
      return 'Generate a QR to start a tiny session.'
    }
    if ( expired ) {
      return 'QR has expired - generate new QR.'
    }
    if ( isPolling ) {
      return 'Scan-based login ready. Processing...'
    }
    if ( pollResult?.status === 'claimed' ) {
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

        <p className="text-sm">{getStateMessage()}</p>
        {expired && (
          <p className="text-sm font-medium text-amber-600">
            QR has expired - generate new QR.
          </p>
        )}

        <div className="flex gap-2">
          <Button
            onClick={() => createOfferMutation.mutate()}
            disabled={createOfferMutation.isPending}
          >
            <RefreshCcw className="size-4" />
            {createOfferMutation.isPending ? 'Generating...' : 'Generate new QR'}
          </Button>
          <Button asChild variant="ghost">
            <Link to="/auth">Back to login</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
