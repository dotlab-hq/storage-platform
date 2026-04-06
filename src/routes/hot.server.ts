import { createServerFn } from '@tanstack/react-start'
import {
  setResponseHeader,
  setResponseStatus,
} from '@tanstack/react-start/server'
import { z } from 'zod'
import { and, inArray, lt, eq, gt } from 'drizzle-orm'
import { db } from '@/db'
import { qrLoginOffer, tinySession } from '@/db/schema/auth-schema'
import {
  buildQrLoginPayload,
  createPollKey,
  createQrOfferCode,
  createTinySessionCookie,
  createTinySessionToken,
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
