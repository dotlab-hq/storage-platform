import { createFileRoute } from '@tanstack/react-router'
import { and, eq, gt } from 'drizzle-orm'
import { db } from '@/db'
import { webrtcTransfer } from '@/db/schema/auth-schema'

export const Route = createFileRoute('/api/webrtc-transfer/poll')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url)
          const pollKey = url.searchParams.get('pollKey')?.trim()
          if (!pollKey) {
            return Response.json(
              { error: 'Missing poll key.' },
              { status: 400 },
            )
          }

          const rows = await db
            .select({
              id: webrtcTransfer.id,
              status: webrtcTransfer.status,
              ownerUserId: webrtcTransfer.ownerUserId,
              requesterSessionId: webrtcTransfer.requesterSessionId,
              expiresAt: webrtcTransfer.expiresAt,
              connectedAt: webrtcTransfer.connectedAt,
            })
            .from(webrtcTransfer)
            .where(eq(webrtcTransfer.pollKey, pollKey))
            .limit(1)

          if (rows.length === 0) {
            return Response.json({ status: 'not_found' }, { status: 404 })
          }

          const transfer = rows[0]
          const now = new Date()
          if (
            (transfer.status === 'pending' || transfer.status === 'claimed') &&
            transfer.expiresAt.getTime() <= now.getTime()
          ) {
            await db
              .update(webrtcTransfer)
              .set({ status: 'expired' })
              .where(eq(webrtcTransfer.id, transfer.id))

            return Response.json({
              status: 'expired',
              message: 'WebRTC offer has expired.',
              expiresAt: transfer.expiresAt.toISOString(),
            })
          }

          if (transfer.status === 'pending') {
            return Response.json({
              status: transfer.status,
              expiresAt: transfer.expiresAt.toISOString(),
            })
          }

          if (transfer.status === 'claimed') {
            await db
              .update(webrtcTransfer)
              .set({ status: 'connected', connectedAt: now })
              .where(
                and(
                  eq(webrtcTransfer.id, transfer.id),
                  eq(webrtcTransfer.status, 'claimed'),
                  gt(webrtcTransfer.expiresAt, now),
                ),
              )

            return Response.json({
              status: 'connected',
              connectedAt: now.toISOString(),
            })
          }

          if (transfer.status === 'connected') {
            return Response.json({
              status: 'connected',
              connectedAt: transfer.connectedAt?.toISOString() ?? null,
            })
          }

          return Response.json({
            status: transfer.status,
            expiresAt: transfer.expiresAt.toISOString(),
          })
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : 'Failed to poll WebRTC transfer.'
          return Response.json({ error: message }, { status: 500 })
        }
      },
    },
  },
})
