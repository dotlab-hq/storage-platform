import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { and, eq, gt, isNull } from 'drizzle-orm'
import { db } from '@/db'
import { tinySession, qrLoginOffer } from '@/db/schema/auth-schema'

const SIGNAL_TTL_MS = 30_000

export const getSignalServerFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      sessionToken: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const { sessionToken } = data

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
      throw new Error('Invalid or expired tiny session.')
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

    return {
      hasSignal: !!peerSignal,
      signal: peerSignal,
    }
  })

export const setSignalServerFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      sessionToken: z.string().min(1),
      signal: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const { sessionToken, signal } = data

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
      throw new Error('Invalid or expired tiny session.')
    }

    const expiresAt = new Date(Date.now() + SIGNAL_TTL_MS)

    await db
      .update(tinySession)
      .set({
        webrtcSignal: signal,
        webrtcSignalExpiresAt: expiresAt,
      })
      .where(eq(tinySession.id, sessionRows[0].id))

    return { success: true }
  })
