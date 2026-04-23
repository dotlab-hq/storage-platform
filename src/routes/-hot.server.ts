import { createServerFn } from '@tanstack/react-start'
import {
  setResponseHeader,
  setResponseStatus,
} from '@tanstack/react-start/server'
import { z } from 'zod'
import {
  buildQrLoginPayload,
  createPollKey,
  createQrOfferCode,
  createTinySessionCookie,
  createTinySessionToken,
  QR_OFFER_TTL_MS,
  TINY_SESSION_TTL_MS,
} from '@/lib/tiny-session'
import { Cache } from '@/lib/Cache'
import type { CachedQrLoginOffer } from './-hot-qr-server'

const OfferResponseSchema = z.object({
  code: z.string(),
  pollKey: z.string(),
  payload: z.string(),
  expiresAt: z.string(),
  pollIntervalMs: z.number(),
})

const PollResponseSchema = z.object({
  status: z.enum([
    'pending',
    'claimed',
    'approved',
    'expired',
    'rejected',
    'not_found',
  ]),
  message: z.string().optional(),
  tinySessionExpiresAt: z.string().optional(),
  permission: z.enum(['read', 'read-write']).optional(),
  error: z.string().optional(),
})

export type OfferResponse = z.infer<typeof OfferResponseSchema>
export type PollResponse = z.infer<typeof PollResponseSchema>

export const createQrOffer = createServerFn({ method: 'POST' }).handler(
  async () => {
    try {
      const currentUser = await getAuthenticatedUser()

      const code = createQrOfferCode()
      const pollKey = createPollKey()
      const expiresAt = new Date(Date.now() + QR_OFFER_TTL_MS)

      const offerData: CachedQrLoginOffer = {
        id: crypto.randomUUID(),
        code,
        pollKey,
        status: 'pending',
        expiresAt: expiresAt.toISOString(),
      }

      await Cache.set(`qr:offer:${pollKey}`, offerData, {
        expirationTtl: Math.floor(QR_OFFER_TTL_MS / 1000),
      })
      await Cache.set(`qr:code:${code}`, pollKey, {
        expirationTtl: Math.floor(QR_OFFER_TTL_MS / 1000),
      })

      const data = {
        code,
        payload: buildQrLoginPayload(code),
        pollKey,
        expiresAt: expiresAt.toISOString(),
        pollIntervalMs: 5000,
      }

      const validatedData = OfferResponseSchema.parse(data)
      return { success: true as const, data: validatedData }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      return { success: false as const, error: errorMessage }
    }
  },
)

export const pollQrStatus = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ pollKey: z.string() }))
  .handler(async ({ data }) => {
    try {
      const pollKey = data.pollKey.trim()
      if (!pollKey) {
        setResponseStatus(400)
        return { success: false, error: 'Missing poll key.' }
      }

      const offer = await Cache.get<CachedQrLoginOffer>(`qr:offer:${pollKey}`)

      if (!offer) {
        setResponseStatus(404)
        const validatedData = PollResponseSchema.parse({ status: 'not_found' })
        return { success: true, data: validatedData }
      }

      const now = new Date()
      const expiresAt = new Date(offer.expiresAt)

      if (
        (offer.status === 'pending' || offer.status === 'claimed') &&
        expiresAt.getTime() <= now.getTime()
      ) {
        await Cache.delete(`qr:offer:${pollKey}`)

        const validatedData = PollResponseSchema.parse({
          status: 'expired',
          message: 'QR has expired. Generate new QR.',
        })
        return { success: true, data: validatedData }
      }

      if (offer.status !== 'claimed') {
        const validatedData = PollResponseSchema.parse({
          status: offer.status,
        })
        return { success: true, data: validatedData }
      }

      if (!offer.ownerUserId) {
        setResponseStatus(409)
        return { success: false, error: 'Owner missing from claimed offer.' }
      }

      const permission =
        offer.requestedPermission === 'read-write' ? 'read-write' : 'read'
      const tinySessionToken = createTinySessionToken()
      const tinySessionExpiresAt = new Date(Date.now() + TINY_SESSION_TTL_MS)

      await Cache.set(
        `session:tiny:${tinySessionToken}`,
        {
          id: crypto.randomUUID(),
          token: tinySessionToken,
          userId: offer.ownerUserId,
          permission,
          sourceOfferId: offer.id,
          expiresAt: tinySessionExpiresAt.toISOString(),
          createdAt: now.toISOString(),
        },
        { expirationTtl: Math.floor(TINY_SESSION_TTL_MS / 1000) },
      )

      offer.status = 'approved'
      offer.claimedAt = now.toISOString()

      await Cache.set(`qr:offer:${pollKey}`, offer, {
        expirationTtl: Math.floor(QR_OFFER_TTL_MS / 1000),
      })

      const cookieValue = createTinySessionCookie(tinySessionToken)
      setResponseHeader('set-cookie', cookieValue)

      const validatedData = PollResponseSchema.parse({
        status: 'approved',
        tinySessionExpiresAt: tinySessionExpiresAt.toISOString(),
      })

      return { success: true as const, data: validatedData }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      return { success: false as const, error: errorMessage }
    }
  })
