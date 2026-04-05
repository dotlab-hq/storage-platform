import { createFileRoute } from '@tanstack/react-router'
import { and, eq, gt, isNull } from 'drizzle-orm'
import { db } from '@/db'
import { tinySession } from '@/db/schema/auth-schema'

const SIGNAL_TTL_MS = 30_000

export const Route = createFileRoute('/api/webrtc/set-signal')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            sessionToken: string
            signal: string
          }
          const { sessionToken, signal } = body

          if (!sessionToken || !signal) {
            return Response.json(
              { error: 'Missing sessionToken or signal.' },
              { status: 400 },
            )
          }

          const sessionRows = await db
            .select({
              id: tinySession.id,
              userId: tinySession.userId,
              expiresAt: tinySession.expiresAt,
            })
            .from(tinySession)
            .where(
              and(
                eq(tinySession.token, sessionToken),
                gt(tinySession.expiresAt, new Date()),
              ),
            )
            .limit(1)

          if (sessionRows.length === 0) {
            return Response.json(
              { error: 'Invalid or expired tiny session.' },
              { status: 401 },
            )
          }

          const expiresAt = new Date(Date.now() + SIGNAL_TTL_MS)

          await db
            .update(tinySession)
            .set({
              webrtcSignal: signal,
              webrtcSignalExpiresAt: expiresAt,
            })
            .where(eq(tinySession.id, sessionRows[0].id))

          return Response.json({ success: true })
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : 'Failed to set WebRTC signal.'
          return Response.json({ error: message }, { status: 500 })
        }
      },
    },
  },
})
