import { createFileRoute } from '@tanstack/react-router'
import { and, eq, gt, isNull } from 'drizzle-orm'
import { db } from '@/db'
import { tinySession, qrLoginOffer } from '@/db/schema/auth-schema'

export const Route = createFileRoute('/api/webrtc/get-signal')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url)
          const sessionToken = url.searchParams.get('sessionToken')?.trim()

          if (!sessionToken) {
            return Response.json(
              { error: 'Missing sessionToken.' },
              { status: 400 },
            )
          }

          const sessionRows = await db
            .select({
              id: tinySession.id,
              userId: tinySession.userId,
              expiresAt: tinySession.expiresAt,
              webrtcSignal: tinySession.webrtcSignal,
              webrtcSignalExpiresAt: tinySession.webrtcSignalExpiresAt,
              sourceOfferId: tinySession.sourceOfferId,
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

          const session = sessionRows[0]

          let peerUserId: string | null = null

          if (session.userId.startsWith('webrtc-owner:')) {
            const pollKey = session.userId.replace('webrtc-owner:', '')
            peerUserId = 'webrtc-scanner:' + pollKey
          } else if (session.userId.startsWith('webrtc-scanner:')) {
            const pollKey = session.userId.replace('webrtc-scanner:', '')
            peerUserId = 'webrtc-owner:' + pollKey
          } else if (session.sourceOfferId) {
            const offerRows = await db
              .select({ ownerUserId: qrLoginOffer.ownerUserId })
              .from(qrLoginOffer)
              .where(eq(qrLoginOffer.id, session.sourceOfferId))
              .limit(1)
            if (offerRows.length > 0) {
              peerUserId = offerRows[0].ownerUserId
            }
          }

          let peerSignal: string | null = null
          if (peerUserId) {
            const peerSessions = await db
              .select({
                webrtcSignal: tinySession.webrtcSignal,
                webrtcSignalExpiresAt: tinySession.webrtcSignalExpiresAt,
              })
              .from(tinySession)
              .where(
                and(
                  eq(tinySession.userId, peerUserId),
                  gt(tinySession.expiresAt, new Date()),
                  isNull(tinySession.revokedAt),
                ),
              )
              .limit(1)

            if (peerSessions.length > 0) {
              const peerSession = peerSessions[0]
              if (
                peerSession.webrtcSignal &&
                peerSession.webrtcSignalExpiresAt &&
                peerSession.webrtcSignalExpiresAt.getTime() > Date.now()
              ) {
                peerSignal = peerSession.webrtcSignal
              }
            }
          }

          return Response.json({
            hasSignal: !!peerSignal,
            signal: peerSignal,
          })
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : 'Failed to get WebRTC signal.'
          return Response.json({ error: message }, { status: 500 })
        }
      },
    },
  },
})
