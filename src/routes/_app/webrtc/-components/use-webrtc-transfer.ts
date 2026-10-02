import { useCallback, useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import * as QRCode from 'qrcode'
import { usePreferencesStore } from '@/stores/preferences-store'
import { createWebrtcOfferFn, pollWebrtcOfferFn } from './webrtc-rpc'
import type { WebrtcOfferRpcResponse } from './webrtc-rpc'

/** How long one QR offer is shown before a new one is generated. */
const OFFER_LIFETIME_MS = 60_000
const POLL_INTERVAL_MS = 1_000
/** Pause on the "expired" message before replacing the QR. */
const REGENERATE_DELAY_MS = 2_000

type ActiveOffer = {
  offer: WebrtcOfferRpcResponse
  qrImage: string
  receivedAt: number
}

/**
 * The offering side of a WebRTC transfer. While transfers are enabled and no
 * peer is connected it keeps a QR offer on screen and polls it until a peer
 * claims it; after a minute (or when the server expires it) a new offer
 * replaces it. A failed request stops and waits for a manual retry.
 */
export function useWebrtcTransfer(isConnected: boolean) {
  const webrtcEnabled = usePreferencesStore((state) => state.webrtcEnabled)
  const setWebrtcEnabled = usePreferencesStore(
    (state) => state.setWebrtcEnabled,
  )
  const [active, setActive] = useState<ActiveOffer | null>(null)
  const [expired, setExpired] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const { mutate: requestOffer, isPending: loading } = useMutation({
    mutationFn: async (): Promise<ActiveOffer> => {
      const offer = await createWebrtcOfferFn()
      const qrImage = await QRCode.toDataURL(offer.payload, {
        width: 260,
        margin: 1,
      })
      return { offer, qrImage, receivedAt: Date.now() }
    },
    onSuccess: (next) => {
      setActive(next)
      setExpired(false)
      setErrorMessage('')
    },
    onError: (error) => {
      setActive(null)
      setExpired(false)
      setErrorMessage(error.message || 'Failed to generate QR code.')
    },
  })

  // `requestOffer` is stable, so this never restarts the effects below.
  const generateQr = useCallback(() => requestOffer(), [requestOffer])

  // Turning transfers off (here or from the sidebar) drops the current offer,
  // so turning them back on starts fresh. Adjusting state while rendering
  // avoids an extra effect pass.
  if (!webrtcEnabled && (active || expired || errorMessage)) {
    setActive(null)
    setExpired(false)
    setErrorMessage('')
  }

  const needsOffer =
    webrtcEnabled && !isConnected && !active && !loading && !errorMessage
  useEffect(() => {
    if (needsOffer) generateQr()
  }, [needsOffer, generateQr])

  const pollKey = active?.offer.pollKey
  const deadline = active ? active.receivedAt + OFFER_LIFETIME_MS : 0
  const shouldPoll =
    Boolean(pollKey) && webrtcEnabled && !isConnected && !expired

  useEffect(() => {
    if (!shouldPoll || !pollKey) return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined

    const expire = (message: string) => {
      setExpired(true)
      setErrorMessage(message)
    }

    const poll = async () => {
      if (Date.now() >= deadline) {
        expire('QR has expired. Generating new QR code.')
        return
      }
      try {
        const { status } = await pollWebrtcOfferFn({ data: { pollKey } })
        if (cancelled || status === 'connected') return
        if (status === 'expired') {
          expire('WebRTC offer has expired.')
          return
        }
      } catch {
        // Transient failure: keep polling until the deadline.
      }
      if (!cancelled) timer = setTimeout(poll, POLL_INTERVAL_MS)
    }

    timer = setTimeout(poll, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [shouldPoll, pollKey, deadline])

  // Replace an expired offer after showing the message briefly.
  const shouldRegenerate = expired && webrtcEnabled && !isConnected
  useEffect(() => {
    if (!shouldRegenerate) return
    const timer = setTimeout(generateQr, REGENERATE_DELAY_MS)
    return () => clearTimeout(timer)
  }, [shouldRegenerate, generateQr])

  const toggleWebRTC = () => setWebrtcEnabled(!webrtcEnabled)

  return {
    webrtcEnabled,
    offer: active?.offer ?? null,
    qrImage: active?.qrImage ?? '',
    loading,
    expired,
    errorMessage,
    toggleWebRTC,
    generateQr,
  }
}
