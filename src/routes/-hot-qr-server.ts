import { createServerFn } from '@tanstack/react-start'
import {
  setResponseHeader,
  setResponseStatus,
  getRequestHeaders,
} from '@tanstack/react-start/server'
import { z } from 'zod'
import { and, inArray, lt, eq, gt, isNull } from 'drizzle-orm'
import { db } from '@/db'
import { qrLoginOffer, tinySession } from '@/db/schema/auth-schema'
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

const ACTIVE_STATUSES = ['pending', 'claimed'] as const

export const createQrOffer = createServerFn({ method: 'POST' }).handler(
  async () => {
    try {
      const now = new Date()

      await db
        .update(qrLoginOffer)
        .set({ status: 'expired' })
        .where(
          and(
            inArray(
              qrLoginOffer.status,
              ACTIVE_STATUSES as unknown as string[],
            ),
            lt(qrLoginOffer.expiresAt, now),
          ),
        )

      const code = createQrOfferCode()
      const pollKey = createPollKey()
      const expiresAt = new Date(Date.now() + QR_OFFER_TTL_MS)

      await db.insert(qrLoginOffer).values({
        id: crypto.randomUUID(),
        code,
        pollKey,
        ownerUserId: null,
        status: 'pending',
        expiresAt,
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

      const rows = await db
        .select({
          id: qrLoginOffer.id,
          status: qrLoginOffer.status,
          ownerUserId: qrLoginOffer.ownerUserId,
          requestedPermission: qrLoginOffer.requestedPermission,
          expiresAt: qrLoginOffer.expiresAt,
        })
        .from(qrLoginOffer)
        .where(eq(qrLoginOffer.pollKey, pollKey))
        .limit(1)

      if (rows.length === 0) {
        setResponseStatus(404)
        const validatedData = PollResponseSchema.parse({ status: 'not_found' })
        return { success: true, data: validatedData }
      }

      const offer = rows[0]
      const now = new Date()

      if (
        (offer.status === 'pending' || offer.status === 'claimed') &&
        offer.expiresAt.getTime() <= now.getTime()
      ) {
        await db
          .update(qrLoginOffer)
          .set({ status: 'expired' })
          .where(eq(qrLoginOffer.id, offer.id))

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

      await db.insert(tinySession).values({
        id: crypto.randomUUID(),
        token: tinySessionToken,
        userId: offer.ownerUserId,
        permission,
        sourceOfferId: offer.id,
        expiresAt: tinySessionExpiresAt,
        createdAt: now,
      })

      await db
        .update(qrLoginOffer)
        .set({ status: 'approved', claimedAt: now })
        .where(
          and(
            eq(qrLoginOffer.id, offer.id),
            eq(qrLoginOffer.status, 'claimed'),
            gt(qrLoginOffer.expiresAt, now),
          ),
        )

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
const CLAIMABLE_STATUSES = ['pending'] as const

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

      const now = new Date()
      const rows = await db
        .select({
          id: qrLoginOffer.id,
          status: qrLoginOffer.status,
          expiresAt: qrLoginOffer.expiresAt,
        })
        .from(qrLoginOffer)
        .where(eq(qrLoginOffer.code, code))
        .limit(1)

      if (rows.length === 0) {
        setResponseStatus(404)
        return { error: 'QR offer not found.' }
      }

      const offer = rows[0]

      if (offer.expiresAt.getTime() <= now.getTime()) {
        await db
          .update(qrLoginOffer)
          .set({ status: 'expired' })
          .where(eq(qrLoginOffer.id, offer.id))
        setResponseStatus(410)
        return { error: 'QR has expired.' }
      }

      if (!CLAIMABLE_STATUSES.includes(offer.status as 'pending')) {
        setResponseStatus(409)
        return { error: 'QR offer is no longer claimable.' }
      }

      await db
        .update(qrLoginOffer)
        .set({
          status: 'claimed',
          ownerUserId: scanner.id,
          claimedByUserId: scanner.id,
          requestedPermission,
        })
        .where(
          and(
            eq(qrLoginOffer.id, offer.id),
            inArray(
              qrLoginOffer.status,
              CLAIMABLE_STATUSES as unknown as string[],
            ),
            isNull(qrLoginOffer.claimedByUserId),
            gt(qrLoginOffer.expiresAt, now),
          ),
        )

      const freshRows = await db
        .select({
          id: qrLoginOffer.id,
          status: qrLoginOffer.status,
          ownerUserId: qrLoginOffer.ownerUserId,
          claimedByUserId: qrLoginOffer.claimedByUserId,
          requestedPermission: qrLoginOffer.requestedPermission,
          expiresAt: qrLoginOffer.expiresAt,
        })
        .from(qrLoginOffer)
        .where(eq(qrLoginOffer.id, offer.id))
        .limit(1)

      const current = freshRows[0]
      if (!current || current.claimedByUserId !== scanner.id) {
        setResponseStatus(409)
        return { error: 'QR was claimed by another device.' }
      }

      return {
        success: true as const,
        data: {
          offerId: current.id,
          status: current.status,
          expiresAt: current.expiresAt.toISOString(),
          requestedPermission: current.requestedPermission,
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
