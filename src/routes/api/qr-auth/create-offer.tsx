import { createFileRoute } from '@tanstack/react-router'
import { and, inArray, lt } from 'drizzle-orm'
import { db } from '@/db'
import { qrLoginOffer } from '@/db/schema/auth-schema'
import {
  buildQrLoginPayload,
  createPollKey,
  createQrOfferCode,
  QR_OFFER_TTL_MS,
} from '@/lib/tiny-session'

const ACTIVE_STATUSES = ['pending', 'claimed'] as const

export const Route = createFileRoute('/api/qr-auth/create-offer')({
  server: {
    handlers: {
      POST: async () => {
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

          return Response.json({
            code,
            payload: buildQrLoginPayload(code),
            pollKey,
            expiresAt: expiresAt.toISOString(),
            pollIntervalMs: 5000,
          })
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : 'Failed to create QR offer.'
          return Response.json({ error: message }, { status: 500 })
        }
      },
    },
  },
})
