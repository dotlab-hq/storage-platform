import { createFileRoute } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { webrtcTransfer } from '@/db/schema/auth-schema'
import { parseWebrtcOfferPayload } from '@/lib/tiny-session'

export const Route = createFileRoute('/api/webrtc-transfer/scan')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            payload: string
          }
          const { payload } = body

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

          await db
            .update(webrtcTransfer)
            .set({
              status: 'claimed',
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
