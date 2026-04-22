import * as React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { QrCode, RefreshCcw } from 'lucide-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import QRCode from 'qrcode'
import { Button } from '@/components/ui/button'
import { isNotAuthenticatedMiddleware } from '@/middlewares/isNotAuthenticated'
import { createQrOffer, pollQrStatus } from './-hot-qr-server'
import type { OfferResponse, PollResponse } from './-hot-qr-server'

const ONE_MINUTE_MS = 60_000

export const Route = createFileRoute('/hot')({
  component: HotRoute,
  server: {
    middleware: [isNotAuthenticatedMiddleware],
  },
})

type UseCreateQrOfferReturn = {
  qrImage: string
  setQrImage: (image: string) => void
  createOfferMutation: UseMutationResult<OfferResponse, Error, void>
}

function useCreateQrOffer(): UseCreateQrOfferReturn {
  const [qrImage, setQrImage] = React.useState<string>('')

  const createOfferMutation = useMutation({
    mutationFn: async () => {
      const result = await createQrOffer()
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    onSuccess: async (data) => {
      try {
        const dataUrl = await QRCode.toDataURL(data.payload, {
          width: 260,
          margin: 1,
        })
        setQrImage(dataUrl)
      } catch (error) {
        console.error('Failed to generate QR image:', error)
      }
    },
    onError: () => {
      setQrImage('')
    },
  })

  return { qrImage, setQrImage, createOfferMutation }
}

type UsePollQrStatusReturn = {
  pollResult: PollResponse | null | undefined
  isPolling: boolean
}

function usePollQrStatus(
  currentOffer: OfferResponse | null | undefined,
  enabled: boolean,
): UsePollQrStatusReturn {
  const { data: pollResult, isLoading: isPolling } = useQuery({
    queryKey: ['pollQrStatus', currentOffer?.pollKey],
    queryFn: async () => {
      if (!currentOffer) return null
      const result = await pollQrStatus({
        data: { pollKey: currentOffer.pollKey },
      })
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    enabled: enabled && currentOffer !== undefined && currentOffer !== null,
    refetchInterval: currentOffer?.pollIntervalMs ?? 5000,
    retry: false,
  })

  return { pollResult, isPolling }
}

function HotRoute() {
  const [expired, setExpired] = React.useState<boolean>(false)
  const startedAtRef = React.useRef<number | null>(null)
  const [currentOffer, setCurrentOffer] = React.useState<OfferResponse | null>(
    null,
  )

  const { qrImage, createOfferMutation } = useCreateQrOffer()

  const { pollResult, isPolling } = usePollQrStatus(
    currentOffer,
    !expired && !(Date.now() - (startedAtRef.current ?? 0) >= ONE_MINUTE_MS),
  )

  React.useEffect(() => {
    // Generate QR on mount
    void createOfferMutation.mutate()
  }, [])

  React.useEffect(() => {
    if (createOfferMutation.isSuccess) {
      startedAtRef.current = Date.now()
      setExpired(false)
      setCurrentOffer(createOfferMutation.data)
    }
  }, [createOfferMutation.isSuccess, createOfferMutation.data])

  React.useEffect(() => {
    if (!startedAtRef.current) return
    if (Date.now() - startedAtRef.current >= ONE_MINUTE_MS) {
      setExpired(true)
    }
  }, [pollResult])

  React.useEffect(() => {
    if (pollResult?.status === 'approved') {
      window.location.href = '/'
    }
  }, [pollResult?.status])

  const getStateMessage = (): string => {
    if (createOfferMutation.isPending) {
      return 'Generating QR...'
    }
    if (createOfferMutation.isError) {
      return createOfferMutation.error.message || 'Failed to generate QR offer.'
    }
    if (!createOfferMutation.isSuccess) {
      return 'Generate a QR to start a tiny session.'
    }
    if (expired) {
      return 'QR has expired - generate new QR.'
    }
    if (isPolling) {
      return 'Scan-based login ready. Processing...'
    }
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
            {createOfferMutation.isPending
              ? 'Generating...'
              : 'Generate new QR'}
          </Button>
          <Button asChild variant="ghost">
            <Link to="/auth">Back to login</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
