import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { and, inArray, lt, eq, gt } from 'drizzle-orm'
import { db } from '@/db'
import { webrtcTransfer, tinySession, user } from '@/db/schema/auth-schema'
import {
  buildWebrtcOfferPayload,
  createWebrtcOfferCode,
  createWebrtcPollKey,
  WEBRTC_OFFER_TTL_MS,
  createTinySessionToken,
  parseWebrtcOfferPayload,
  TINY_SESSION_TTL_MS,
} from '@/lib/tiny-session'

const ACTIVE_STATUSES = ['pending', 'claimed'] as const
const ANONYMOUS_USER_ID = 'anonymous_webrtc_user'

export const createOffer = createServerFn({ method: 'POST' }).handler(
  async () => {
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

    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.id, ANONYMOUS_USER_ID))
      .limit(1)

    if (existingUser.length === 0) {
      await db
        .insert(user)
        .values({
          id: ANONYMOUS_USER_ID,
          name: 'Anonymous WebRTC Transfer',
          email: 'anonymous@webrtc.local',
        })
        .onConflictDoNothing()
    }

    const code = createWebrtcOfferCode()
    const pollKey = createWebrtcPollKey()
    const expiresAt = new Date(Date.now() + WEBRTC_OFFER_TTL_MS)

    const sessionToken = createTinySessionToken()
    const sessionId = crypto.randomUUID()

    await db.insert(tinySession).values({
      id: sessionId,
      token: sessionToken,
      userId: ANONYMOUS_USER_ID,
      permission: 'webrtc-owner:' + pollKey,
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

    return {
      code,
      payload: buildWebrtcOfferPayload(code),
      pollKey,
      sessionToken,
      expiresAt: expiresAt.toISOString(),
      pollIntervalMs: 5000,
    }
  },
)

export const pollOffer = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ pollKey: z.string() }))
  .handler(async ({ data: { pollKey } }) => {
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
      throw new Error('not_found')
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

      return {
        status: 'expired',
        message: 'WebRTC offer has expired.',
        expiresAt: transfer.expiresAt.toISOString(),
      }
    }

    if (transfer.status === 'pending') {
      return {
        status: transfer.status,
        expiresAt: transfer.expiresAt.toISOString(),
      }
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

      return {
        status: 'connected',
        connectedAt: now.toISOString(),
      }
    }

    if (transfer.status === 'connected') {
      return {
        status: 'connected',
        connectedAt: transfer.connectedAt?.toISOString() ?? null,
      }
    }

    return {
      status: transfer.status,
      expiresAt: transfer.expiresAt.toISOString(),
    }
  })

export const scanOffer = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ payload: z.string() }))
  .handler(async ({ data: { payload } }) => {
    const code = parseWebrtcOfferPayload(payload)
    if (!code) {
      throw new Error('Invalid WebRTC offer payload.')
    }

    const now = new Date()

    const rows = await db
      .select({
        id: webrtcTransfer.id,
        status: webrtcTransfer.status,
        expiresAt: webrtcTransfer.expiresAt,
        pollKey: webrtcTransfer.pollKey,
      })
      .from(webrtcTransfer)
      .where(eq(webrtcTransfer.offerCode, code))
      .limit(1)

    if (rows.length === 0) {
      throw new Error('WebRTC offer not found or expired.')
    }

    const transfer = rows[0]
    if (transfer.status !== 'pending' && transfer.status !== 'claimed') {
      throw new Error(`WebRTC offer is ${transfer.status}.`)
    }

    if (transfer.expiresAt.getTime() <= now.getTime()) {
      await db
        .update(webrtcTransfer)
        .set({ status: 'expired' })
        .where(eq(webrtcTransfer.id, transfer.id))
      throw new Error('WebRTC offer has expired.')
    }

    const anonToken = createTinySessionToken()
    const expiresAt = new Date(Date.now() + TINY_SESSION_TTL_MS)
    const anonSessionId = crypto.randomUUID()

    await db.insert(tinySession).values({
      id: anonSessionId,
      token: anonToken,
      userId: ANONYMOUS_USER_ID,
      permission: 'webrtc-scanner:' + transfer.pollKey,
      expiresAt,
      createdAt: now,
    })

    await db
      .update(webrtcTransfer)
      .set({ status: 'claimed', requesterSessionId: anonSessionId })
      .where(eq(webrtcTransfer.id, transfer.id))

    return {
      success: true,
      status: 'claimed',
      sessionToken: anonToken,
      message: 'WebRTC offer claimed. Starting peer connection...',
      pollIntervalMs: 5000,
    }
  })

export const statusOffer = createServerFn({ method: 'GET' }).handler(
  async () => {
    const rows = await db
      .select({ status: webrtcTransfer.status })
      .from(webrtcTransfer)
      .where(eq(webrtcTransfer.status, 'connected'))
      .limit(1)

    if (rows.length > 0) {
      return { status: 'connected' }
    }

    return { status: 'waiting' }
  },
)
