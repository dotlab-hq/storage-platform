import { createServerFn } from '@tanstack/react-start'
import {
  setResponseHeader,
  setResponseStatus,
  getRequestHeaders,
} from '@tanstack/react-start/server'
import { z } from 'zod'
import { getAuthenticatedUser } from '@/lib/server-auth'
import {
  buildQrLoginPayload,
  createPollKey,
  createQrOfferCode,
  createTinySessionCookie,
  createTinySessionToken,
  parseQrLoginPayload,
  resolveTinySessionFromHeaders,
  QR_OFFER_TTL_MS,
  TINY_SESSION_TTL_MS,
} from '@/lib/tiny-session'
import { Cache } from '@/lib/Cache'

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

export type CachedQrLoginOffer = {
  id: string
  code: string
  pollKey: string
  ownerUserId?: string
  status: string
  requestedPermission?: string
  expiresAt: string
  claimedByUserId?: string
  claimedAt?: string
}

export const createQrOffer = createServerFn({ method: 'POST' }).handler(
  async () => {
    try {
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
const REQUEST_PERMISSION_VALUES = ['read', 'read-write'] as const

export const scanQrFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      payload: z.string().optional(),
      requestedPermission: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    try {
      const scanner = await getAuthenticatedUser()

      const payload = data.payload?.trim() ?? ''
      const code = parseQrLoginPayload(payload)
      if (!code) {
        setResponseStatus(400)
        return { error: 'Invalid QR payload.' }
      }

      const requestedPermission = REQUEST_PERMISSION_VALUES.includes(
        data.requestedPermission as (typeof REQUEST_PERMISSION_VALUES)[number],
      )
        ? (data.requestedPermission as 'read' | 'read-write')
        : 'read'

      const pollKey = await Cache.get<string>(`qr:code:${code}`)
      if (!pollKey) {
        setResponseStatus(404)
        return { error: 'QR offer not found.' }
      }

      const offer = await Cache.get<CachedQrLoginOffer>(`qr:offer:${pollKey}`)

      if (!offer) {
        setResponseStatus(404)
        return { error: 'QR offer not found.' }
      }

      const now = new Date()
      const expiresAt = new Date(offer.expiresAt)

      if (expiresAt.getTime() <= now.getTime()) {
        await Cache.delete(`qr:offer:${pollKey}`)
        setResponseStatus(410)
        return { error: 'QR has expired.' }
      }

      if (offer.status !== 'pending') {
        setResponseStatus(409)
        return { error: 'QR offer is no longer claimable.' }
      }

      if (offer.claimedByUserId && offer.claimedByUserId !== scanner.id) {
        setResponseStatus(409)
        return { error: 'QR was claimed by another device.' }
      }

      offer.status = 'claimed'
      offer.ownerUserId = scanner.id
      offer.claimedByUserId = scanner.id
      offer.requestedPermission = requestedPermission

      await Cache.set(`qr:offer:${pollKey}`, offer, {
        expirationTtl: Math.floor(QR_OFFER_TTL_MS / 1000),
      })

      return {
        success: true as const,
        data: {
          offerId: offer.id,
          status: offer.status,
          expiresAt: offer.expiresAt,
          requestedPermission: offer.requestedPermission,
        },
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to scan QR.'
      const status = /Unauthorized/i.test(message) ? 401 : 500
      setResponseStatus(status)
      return { error: message }
    }
  })

export const sessionStatusFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const headers = getRequestHeaders()
    const mappedHeaders = new Headers()
    Object.entries(headers).forEach(([key, val]) => {
      if (typeof val === 'string') {
        mappedHeaders.append(key, val)
      } else if (Array.isArray(val)) {
        val.forEach((v) => mappedHeaders.append(key, v))
      }
    })

    const tinySession = await resolveTinySessionFromHeaders(mappedHeaders)

    if (!tinySession) {
      return { active: false }
    }

    return {
      active: true,
      permission: tinySession.permission,
      expiresAt: tinySession.expiresAt.toISOString(),
    }
  },
)
