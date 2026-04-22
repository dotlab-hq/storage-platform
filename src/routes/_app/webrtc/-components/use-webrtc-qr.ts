import { useQuery } from '@tanstack/react-query'
import * as React from 'react'
import QRCode from 'qrcode'

export type OfferResponse = {
  code: string
  pollKey: string
  payload: string
  expiresAt: string
  pollIntervalMs: number
}

export const WEBRTC_ENABLED_KEY = 'dot_webrtc_enabled'

export function useWebrtcQr(isConnected: boolean) {
  const [webrtcEnabled, setWebrtcEnabled] = React.useState(false)
  const [qrImage, setQrImage] = React.useState('')
  const [offer, setOffer] = React.useState<OfferResponse | null>(null)
  const [expired, setExpired] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState('')

  React.useEffect(() => {
    const stored = localStorage.getItem(WEBRTC_ENABLED_KEY)
    setWebrtcEnabled(stored === 'true')

    const handleToggle = (e: CustomEvent) => {
      setWebrtcEnabled(e.detail)
    }
    window.addEventListener('webrtc-toggled', handleToggle as EventListener)
    return () =>
      window.removeEventListener(
        'webrtc-toggled',
        handleToggle as EventListener,
      )
  }, [])

  const generateQrQuery = useQuery({
    queryKey: ['webrtc-qr-offer'],
    queryFn: async () => {
      const response = await fetch('/api/qr-auth/create-offer', {
        method: 'POST',
      })
      const data = await response.json()
      if (!response.ok || !('payload' in (data as any))) {
        throw new Error(
          (data as { error?: string }).error ?? 'Failed to generate QR offer.',
        )
      }
      const dataUrl = await QRCode.toDataURL((data as any).payload, {
        width: 260,
        margin: 1,
      })
      return { offer: data as any, dataUrl }
    },
    enabled: false,
  })
  const generateQr = () => generateQrQuery.refetch()
  React.useEffect(() => {
    if (generateQrQuery.data) {
      setOffer(generateQrQuery.data.offer)
      setQrImage(generateQrQuery.data.dataUrl)
    }
  }, [generateQrQuery.data])
  React.useEffect(() => {
    if (generateQrQuery.error) {
      setErrorMessage(
        generateQrQuery.error instanceof Error
          ? generateQrQuery.error.message
          : 'Failed to generate QR code.',
      )
      setExpired(true)
      setOffer(null)
      setQrImage('')
    }
  }, [generateQrQuery.error])
  const loading = generateQrQuery.isFetching

  const toggleWebRTC = () => {
    const newValue = !webrtcEnabled
    setWebrtcEnabled(newValue)
    localStorage.setItem(WEBRTC_ENABLED_KEY, String(newValue))
    window.dispatchEvent(
      new CustomEvent('webrtc-toggled', { detail: newValue }),
    )
  }

  React.useEffect(() => {
    if (webrtcEnabled && !offer && !isConnected) {
      void generateQr()
    }
  }, [webrtcEnabled, offer, isConnected, generateQr])

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
          `/api/qr-auth/poll?pollKey=${encodeURIComponent(offer.pollKey)}`,
        )
        const pollData = await response.json()

        if (!response.ok) {
          throw new Error('Poll failed')
        }

        const status = (
          pollData as { status: string; tinySessionExpiresAt?: string }
        ).status

        if (status === 'approved' || status === 'claimed') {
          const pollInterval =
            (pollData as { pollIntervalMs?: number }).pollIntervalMs || 1000
          if (!cancelled) {
            setTimeout(poll, pollInterval)
          }
        } else if (status === 'expired') {
          setExpired(true)
          setErrorMessage('QR has expired. Generating new QR code.')
          setTimeout(() => {
            if (!cancelled) {
              void generateQr()
            }
          }, 2000)
          return
        } else {
          const pollInterval =
            (pollData as { pollIntervalMs?: number }).pollIntervalMs || 1000
          if (!cancelled) {
            setTimeout(poll, pollInterval)
          }
        }
      } catch (error) {
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
    loading,
    expired,
    errorMessage,
    toggleWebRTC,
    generateQr,
  }
}
