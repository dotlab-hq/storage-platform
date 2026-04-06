import { useQuery, useMutation } from '@tanstack/react-query'
import * as React from 'react'
import QRCode from 'qrcode'
import { WEBRTC_TRANSFER_PREFIX } from '@/lib/webrtc-transfer-utils'
import { createOffer, pollOffer, scanOffer } from './webrtc-server'

export type WebrtcOfferResponse = {
  code: string
  payload: string
  pollKey: string
  sessionToken?: string
  expiresAt: string
  pollIntervalMs: number
}

export const WEBRTC_TRANSFER_ENABLED_KEY = 'dot_webrtc_transfer_enabled'

export function useWebrtcTransfer(isConnected: boolean) {
  const [webrtcEnabled, setWebrtcEnabled] = React.useState(false)
  const [qrImage, setQrImage] = React.useState('')
  const [offer, setOffer] = React.useState<WebrtcOfferResponse | null>(null)
  const [expired, setExpired] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState('')
  const [connectionStatus, setConnectionStatus] =
    React.useState<string>('disconnected')

  React.useEffect(() => {
    const stored = localStorage.getItem(WEBRTC_TRANSFER_ENABLED_KEY)
    setWebrtcEnabled(stored === 'true')
  }, [])

  const createOfferQuery = useQuery({
    queryKey: ['webrtc-transfer-offer'],
    queryFn: async () => {
      const data = await createOffer()
      const dataUrl = await QRCode.toDataURL(data.payload, {
        width: 260,
        margin: 1,
      })
      const offerResponse: WebrtcOfferResponse = {
        code: data.code,
        payload: data.payload,
        pollKey: data.pollKey,
        sessionToken: data.sessionToken,
        expiresAt: data.expiresAt,
        pollIntervalMs: data.pollIntervalMs,
      }
      return { offer: offerResponse, dataUrl }
    },
    enabled: false,
  })

  const generateQr = () => createOfferQuery.refetch()

  React.useEffect(() => {
    if (createOfferQuery.data) {
      setOffer(createOfferQuery.data.offer)
      setQrImage(createOfferQuery.data.dataUrl)
      setExpired(false)
      setErrorMessage('')
    }
  }, [createOfferQuery.data])

  React.useEffect(() => {
    if (createOfferQuery.error) {
      setErrorMessage(
        createOfferQuery.error instanceof Error
          ? createOfferQuery.error.message
          : 'Failed to generate QR code.',
      )
      setExpired(true)
      setOffer(null)
      setQrImage('')
    }
  }, [createOfferQuery.error])

  const loading = createOfferQuery.isFetching

  const toggleWebRTC = () => {
    const newValue = !webrtcEnabled
    setWebrtcEnabled(newValue)
    localStorage.setItem(WEBRTC_TRANSFER_ENABLED_KEY, String(newValue))
    window.dispatchEvent(
      new CustomEvent('webrtc-transfer-toggled', { detail: newValue }),
    )

    if (!newValue) {
      setOffer(null)
      setQrImage('')
      setConnectionStatus('disconnected')
    }
  }

  React.useEffect(() => {
    if (webrtcEnabled && !offer && !isConnected) {
      void generateQr()
    }
  }, [webrtcEnabled, offer, isConnected])

  React.useEffect(() => {
    if (!offer || expired || isConnected) return

    let cancelled = false
    const startedAt = Date.now()

    const poll = async () => {
      if (cancelled) return

      const ONE_MINUTE_MS = 60_000
      if (Date.now() - startedAt >= ONE_MINUTE_MS) {
        setExpired(true)
        setErrorMessage('QR has expired. Generating new QR code.')
        setTimeout(() => {
          if (!cancelled) void generateQr()
        }, 2000)
        return
      }

      try {
        const pollData = await pollOffer({ data: { pollKey: offer.pollKey } })

        const status = pollData.status

        if (status === 'connected') {
          setConnectionStatus('connected')
          return
        } else if (status === 'expired') {
          setExpired(true)
          setErrorMessage('WebRTC offer has expired.')
          setTimeout(() => {
            if (!cancelled) void generateQr()
          }, 2000)
          return
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          if (!cancelled) setTimeout(poll, 1000)
        }
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!cancelled) setTimeout(poll, 1000)
      }
    }

    const pollTimer = setTimeout(poll, 1000)
    return () => {
      cancelled = true
      clearTimeout(pollTimer)
    }
  }, [offer, expired, isConnected, generateQr])

  return {
    webrtcEnabled,
    qrImage,
    offer,
    loading,
    expired,
    errorMessage,
    connectionStatus,
    toggleWebRTC,
    generateQr,
  }
}

export function useWebrtcScanner() {
  const [error, setError] = React.useState<string>('')
  const [connectionStatus, setConnectionStatus] = React.useState<
    'idle' | 'claimed' | 'connected' | 'error'
  >('idle')
  const [sessionToken, setSessionToken] = React.useState<string | null>(null)

  const submitMutation = useMutation({
    mutationFn: async (payload: string) => {
      return await scanOffer({ data: { payload } })
    },
    onSuccess: (data) => {
      if (data.sessionToken) {
        setSessionToken(data.sessionToken)
        setConnectionStatus('claimed')
      }
    },
    onError: (err: Error) => {
      setError(err.message)
      setConnectionStatus('error')
    },
  })

  const handleScanned = (payload: string) => {
    if (!payload.startsWith(WEBRTC_TRANSFER_PREFIX)) {
      setError('Invalid WebRTC transfer QR code')
      return
    }
    submitMutation.mutate(payload)
  }

  const reset = () => {
    setError('')
    setConnectionStatus('idle')
    setSessionToken(null)
  }

  return {
    error,
    setError,
    handleScanned,
    submitMutation,
    isSubmitting: submitMutation.isPending,
    connectionStatus,
    sessionToken,
    reset,
  }
}
