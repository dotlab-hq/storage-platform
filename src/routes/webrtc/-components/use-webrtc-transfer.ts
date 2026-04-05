import { useQuery, useMutation } from '@tanstack/react-query'
import * as React from 'react'
import QRCode from 'qrcode'
import { toast } from '@/components/ui/sonner'
import { WEBRTC_TRANSFER_PREFIX } from '@/lib/tiny-session'

export type WebrtcOfferResponse = {
  code: string
  payload: string
  pollKey: string
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
      const response = await fetch('/api/webrtc-transfer/create-offer', {
        method: 'POST',
      })
      const data = (await response.json()) as {
        error?: string
        payload?: string
        code?: string
        pollKey?: string
        expiresAt?: string
        pollIntervalMs?: number
      }
      if (!response.ok || !data.payload) {
        throw new Error(data.error ?? 'Failed to create WebRTC offer.')
      }
      const dataUrl = await QRCode.toDataURL(data.payload, {
        width: 260,
        margin: 1,
      })
      const offer: WebrtcOfferResponse = {
        code: data.code ?? '',
        payload: data.payload,
        pollKey: data.pollKey ?? '',
        expiresAt: data.expiresAt ?? '',
        pollIntervalMs: data.pollIntervalMs ?? 5000,
      }
      return { offer, dataUrl }
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
          if (!cancelled) {
            void generateQr()
          }
        }, 2000)
        return
      }

      try {
        const response = await fetch(
          `/api/webrtc-transfer/poll?pollKey=${encodeURIComponent(offer.pollKey)}`,
        )
        const pollData = (await response.json()) as {
          status?: string
          pollIntervalMs?: number
          error?: string
        }

        if (!response.ok) {
          throw new Error('Poll failed')
        }

        const status = pollData.status

        if (status === 'connected') {
          setConnectionStatus('connected')
          return
        } else if (status === 'expired') {
          setExpired(true)
          setErrorMessage('WebRTC offer has expired.')
          setTimeout(() => {
            if (!cancelled) {
              void generateQr()
            }
          }, 2000)
          return
        } else {
          const pollInterval = pollData.pollIntervalMs || 1000
          if (!cancelled) {
            setTimeout(poll, pollInterval)
          }
        }
      } catch {
        if (!cancelled) {
          setTimeout(poll, 1000)
        }
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
  const [scanning, setScanning] = React.useState(false)
  const [scannedPayload, setScannedPayload] = React.useState<string | null>(
    null,
  )
  const [error, setError] = React.useState<string>('')

  const submitMutation = useMutation({
    mutationFn: async (payload: string) => {
      const response = await fetch('/api/webrtc-transfer/scan', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ payload }),
      })
      const data = (await response.json()) as {
        error?: string
        status?: string
        message?: string
      }
      if (!response.ok) {
        throw new Error(data.error ?? 'Failed to scan WebRTC offer.')
      }
      return data
    },
    onSuccess: (data) => {
      toast.success('WebRTC offer claimed. Waiting for connection...')
      setScannedPayload(data.status ?? '')
    },
    onError: (error: Error) => {
      setError(error.message)
    },
  })

  const handleScanned = (payload: string) => {
    if (!payload.startsWith(WEBRTC_TRANSFER_PREFIX)) {
      setError('Invalid WebRTC transfer QR code')
      return
    }
    setScannedPayload(payload)
    submitMutation.mutate(payload)
  }

  return {
    scanning,
    setScanning,
    scannedPayload,
    error,
    setError,
    handleScanned,
    submitMutation,
    isSubmitting: submitMutation.isPending,
  }
}
