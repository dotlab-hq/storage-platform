import { createFileRoute } from '@tanstack/react-router'
import { and, eq, gt, isNull } from 'drizzle-orm'
import { db } from '@/db'
import { tinySession, webrtcTransfer } from '@/db/schema/auth-schema'
import {
  parseWebrtcOfferPayload,
  TINY_SESSION_TTL_MS,
  createTinySessionToken,
} from '@/lib/tiny-session'

export const Route = createFileRoute('/api/webrtc-transfer/scan')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            payload: string
            sessionToken?: string
          }
          const { payload, sessionToken } = body

          if (!payload) {
            return Response.json({ error: 'Missing payload.' }, { status: 400 })
          }

          const code = parseWebrtcOfferPayload(payload)
          if (!code) {
            return Response.json(
              { error: 'Invalid WebRTC offer payload.' },
              { status: 400 },
            )
          }

          const now = new Date()

          let tinySessionId: string | null = null
          if (sessionToken) {
            const sessionRows = await db
              .select({ id: tinySession.id })
              .from(tinySession)
              .where(
                and(
                  eq(tinySession.token, sessionToken),
                  gt(tinySession.expiresAt, now),
                  isNull(tinySession.revokedAt),
                ),
              )
              .limit(1)
            if (sessionRows.length > 0) {
              tinySessionId = sessionRows[0].id
            }
          }

          const rows = await db
            .select({
              id: webrtcTransfer.id,
              status: webrtcTransfer.status,
              expiresAt: webrtcTransfer.expiresAt,
              ownerUserId: webrtcTransfer.ownerUserId,
            })
            .from(webrtcTransfer)
            .where(eq(webrtcTransfer.offerCode, code))
            .limit(1)

          if (rows.length === 0) {
            return Response.json(
              { error: 'WebRTC offer not found or expired.' },
              { status: 404 },
            )
          }

          const transfer = rows[0]
          if (transfer.status !== 'pending' && transfer.status !== 'claimed') {
            return Response.json(
              { error: `WebRTC offer is ${transfer.status}.` },
              { status: 400 },
            )
          }

          if (transfer.expiresAt.getTime() <= now.getTime()) {
            await db
              .update(webrtcTransfer)
              .set({ status: 'expired' })
              .where(eq(webrtcTransfer.id, transfer.id))

            return Response.json(
              { error: 'WebRTC offer has expired.' },
              { status: 400 },
            )
          }

          let requesterSessionId: string | null = null

          if (tinySessionId) {
            requesterSessionId = tinySessionId
          }

          if (!requesterSessionId) {
            const newToken = createTinySessionToken()
            const expiresAt = new Date(Date.now() + TINY_SESSION_TTL_MS)

            const newSessionId = crypto.randomUUID()
            await db.insert(tinySession).values({
              id: newSessionId,
              token: newToken,
              userId: 'anonymous-requester',
              permission: 'read',
              expiresAt,
              createdAt: now,
            })

            requesterSessionId = newSessionId
          }

          await db
            .update(webrtcTransfer)
            .set({
              status: 'claimed',
              requesterSessionId: requesterSessionId,
            })
            .where(eq(webrtcTransfer.id, transfer.id))

          return Response.json({
            success: true,
            status: 'claimed',
            message: 'WebRTC offer claimed. Waiting for connection...',
            pollIntervalMs: 5000,
          })
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : 'Failed to scan WebRTC offer.'
          return Response.json({ error: message }, { status: 500 })
        }
      },
    },
  },
})
