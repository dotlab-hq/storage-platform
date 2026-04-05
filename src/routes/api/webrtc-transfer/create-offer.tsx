import { createFileRoute } from '@tanstack/react-router'
import { and, inArray, lt } from 'drizzle-orm'
import { db } from '@/db'
import { webrtcTransfer, tinySession } from '@/db/schema/auth-schema'
import {
  buildWebrtcOfferPayload,
  createWebrtcOfferCode,
  createWebrtcPollKey,
  WEBRTC_OFFER_TTL_MS,
  createTinySessionToken,
} from '@/lib/tiny-session'

const ACTIVE_STATUSES = ['pending', 'claimed'] as const

export const Route = createFileRoute('/api/webrtc-transfer/create-offer')({
  server: {
    handlers: {
      POST: async () => {
        try {
          const now = new Date()

          await db
            .update(webrtcTransfer)
            .set({ status: 'expired' })
            .where(
              and(
                inArray(
                  webrtcTransfer.status,
                  ACTIVE_STATUSES as unknown as string[],
                ),
                lt(webrtcTransfer.expiresAt, now),
              ),
            )

          const code = createWebrtcOfferCode()
          const pollKey = createWebrtcPollKey()
          const expiresAt = new Date(Date.now() + WEBRTC_OFFER_TTL_MS)

          const sessionToken = createTinySessionToken()
          const sessionId = crypto.randomUUID()

          await db.insert(tinySession).values({
            id: sessionId,
            token: sessionToken,
            userId: 'webrtc-owner:' + pollKey,
            permission: 'read',
            expiresAt,
            createdAt: now,
          })

          await db.insert(webrtcTransfer).values({
            id: crypto.randomUUID(),
            offerCode: code,
            pollKey,
            offerType: 'offer',
            status: 'pending',
            expiresAt,
          })

          return Response.json({
            code,
            payload: buildWebrtcOfferPayload(code),
            pollKey,
            sessionToken,
            expiresAt: expiresAt.toISOString(),
            pollIntervalMs: 5000,
          })
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : 'Failed to create WebRTC offer.'
          return Response.json({ error: message }, { status: 500 })
        }
      },
    },
  },
})
