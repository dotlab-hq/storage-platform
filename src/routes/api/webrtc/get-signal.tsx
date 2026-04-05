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
              permission: tinySession.permission,
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

          let targetPermission: string | null = null

          if (session.permission?.startsWith('webrtc-owner:')) {
            const pollKey = session.permission.replace('webrtc-owner:', '')
            targetPermission = 'webrtc-scanner:' + pollKey
          } else if (session.permission?.startsWith('webrtc-scanner:')) {
            const pollKey = session.permission.replace('webrtc-scanner:', '')
            targetPermission = 'webrtc-owner:' + pollKey
          }

          let peerSignal: string | null = null

          if (targetPermission) {
            const peerSessions = await db
              .select({
                webrtcSignal: tinySession.webrtcSignal,
                webrtcSignalExpiresAt: tinySession.webrtcSignalExpiresAt,
              })
              .from(tinySession)
              .where(
                and(
                  eq(tinySession.permission, targetPermission),
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
          } else if (session.sourceOfferId) {
            // fallback for old qrLoginOffer logic
            const offerRows = await db
              .select({ ownerUserId: qrLoginOffer.ownerUserId })
              .from(qrLoginOffer)
              .where(eq(qrLoginOffer.id, session.sourceOfferId))
              .limit(1)
            if (offerRows.length > 0 && offerRows[0].ownerUserId) {
              const peerSessions = await db
                .select({
                  webrtcSignal: tinySession.webrtcSignal,
                  webrtcSignalExpiresAt: tinySession.webrtcSignalExpiresAt,
                })
                .from(tinySession)
                .where(
                  and(
                    eq(tinySession.userId, offerRows[0].ownerUserId),
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
