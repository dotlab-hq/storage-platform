import { useMutation, useQuery } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import QRCode from 'qrcode'
import * as React from 'react'
import { createQrOffer, pollQrStatus } from '@/routes/-hot.server'
import type { OfferResponse, PollResponse } from '@/routes/-hot.server'

export type UseCreateQrOfferReturn = {
  qrImage: string
  setQrImage: (image: string) => void
  createOfferMutation: UseMutationResult<OfferResponse, Error, void>
}

export function useCreateQrOffer(): UseCreateQrOfferReturn {
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

export type UsePollQrStatusReturn = {
  pollResult: PollResponse | null | undefined
  isPolling: boolean
}

export function usePollQrStatus(
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
