import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

export type WebrtcOfferRpcResponse = {
  code: string
  payload: string
  pollKey: string
  sessionToken?: string
  expiresAt: string
  pollIntervalMs: number
}

export type WebrtcPollRpcResponse = {
  status: string
  message?: string
  expiresAt?: string
  connectedAt?: string | null
}

export type WebrtcScanRpcResponse = {
  success: boolean
  status: string
  sessionToken?: string
  message: string
  pollIntervalMs: number
}

const PollOfferInput = z.object({ pollKey: z.string().min(1) })
const ScanOfferInput = z.object({ payload: z.string().min(1) })

export const createWebrtcOfferFn = createServerFn({ method: 'POST' }).handler(
  async (): Promise<WebrtcOfferRpcResponse> => {
    try {
      const { createOffer } = await import('./webrtc-server')
      return await createOffer()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create QR offer.'
      throw new Error(message)
    }
  },
)

export const pollWebrtcOfferFn = createServerFn({ method: 'POST' })
  .inputValidator(PollOfferInput)
  .handler(async ({ data }): Promise<WebrtcPollRpcResponse> => {
    try {
      const { pollOffer } = await import('./webrtc-server')
      return await pollOffer({ data })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to poll QR offer.'
      throw new Error(message)
    }
  })

export const scanWebrtcOfferFn = createServerFn({ method: 'POST' })
  .inputValidator(ScanOfferInput)
  .handler(async ({ data }): Promise<WebrtcScanRpcResponse> => {
    try {
      const { scanOffer } = await import('./webrtc-server')
      return await scanOffer({ data })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to scan QR offer.'
      throw new Error(message)
    }
  })
