import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { user } from '@/db/schema/auth-schema'
import {
  buildWebrtcOfferPayload,
  createWebrtcOfferCode,
  createWebrtcPollKey,
  WEBRTC_OFFER_TTL_MS,
  createTinySessionToken,
  parseWebrtcOfferPayload,
  TINY_SESSION_TTL_MS,
} from '@/lib/tiny-session'
import { Cache } from '@/lib/Cache'

const ANONYMOUS_USER_ID = 'anonymous_webrtc_user'

export type CachedWebrtcTransfer = {
  id: string
  offerCode: string
  pollKey: string
  offerType: string
  status: string
  expiresAt: string
  connectedAt?: string
  requesterSessionId?: string
}

export const createOffer = createServerFn({ method: 'POST' }).handler(
  async () => {
    const now = new Date()

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

    await Cache.set(
      `session:tiny:${sessionToken}`,
      {
        id: sessionId,
        token: sessionToken,
        userId: ANONYMOUS_USER_ID,
        permission: 'webrtc-owner:' + pollKey,
        expiresAt: expiresAt.toISOString(),
        createdAt: now.toISOString(),
      },
      { expirationTtl: Math.floor(WEBRTC_OFFER_TTL_MS / 1000) },
    )

    const transferData: CachedWebrtcTransfer = {
      id: crypto.randomUUID(),
      offerCode: code,
      pollKey,
      offerType: 'offer',
      status: 'pending',
      expiresAt: expiresAt.toISOString(),
    }

    await Cache.set(`webrtc:transfer:${pollKey}`, transferData, {
      expirationTtl: Math.floor(WEBRTC_OFFER_TTL_MS / 1000),
    })
    await Cache.set(`webrtc:code:${code}`, pollKey, {
      expirationTtl: Math.floor(WEBRTC_OFFER_TTL_MS / 1000),
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
    const transfer = await Cache.get<CachedWebrtcTransfer>(
      `webrtc:transfer:${pollKey}`,
    )

    if (!transfer) {
      throw new Error('not_found')
    }

    const now = new Date()
    const expiresAt = new Date(transfer.expiresAt)

    if (
      (transfer.status === 'pending' || transfer.status === 'claimed') &&
      expiresAt.getTime() <= now.getTime()
    ) {
      await Cache.delete(`webrtc:transfer:${pollKey}`)

      return {
        status: 'expired',
        message: 'WebRTC offer has expired.',
        expiresAt: transfer.expiresAt,
      }
    }

    if (transfer.status === 'pending') {
      return {
        status: transfer.status,
        expiresAt: transfer.expiresAt,
      }
    }

    if (transfer.status === 'claimed') {
      transfer.status = 'connected'
      transfer.connectedAt = now.toISOString()

      await Cache.set(`webrtc:transfer:${pollKey}`, transfer, {
        expirationTtl: Math.floor(WEBRTC_OFFER_TTL_MS / 1000),
      })

      return {
        status: 'connected',
        connectedAt: transfer.connectedAt,
      }
    }

    if (transfer.status === 'connected') {
      return {
        status: 'connected',
        connectedAt: transfer.connectedAt ?? null,
      }
    }

    return {
      status: transfer.status,
      expiresAt: transfer.expiresAt,
    }
  })

export const scanOffer = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ payload: z.string() }))
  .handler(async ({ data: { payload } }) => {
    const code = parseWebrtcOfferPayload(payload)
    if (!code) {
      throw new Error('Invalid WebRTC offer payload.')
    }

    const pollKey = await Cache.get<string>(`webrtc:code:${code}`)
    if (!pollKey) {
      throw new Error('WebRTC offer not found or expired.')
    }

    const transfer = await Cache.get<CachedWebrtcTransfer>(
      `webrtc:transfer:${pollKey}`,
    )

    if (!transfer) {
      throw new Error('WebRTC offer not found or expired.')
    }

    const now = new Date()
    const expiresAt = new Date(transfer.expiresAt)

    if (transfer.status !== 'pending' && transfer.status !== 'claimed') {
      throw new Error(`WebRTC offer is ${transfer.status}.`)
    }

    if (expiresAt.getTime() <= now.getTime()) {
      await Cache.delete(`webrtc:transfer:${pollKey}`)
      throw new Error('WebRTC offer has expired.')
    }

    const anonToken = createTinySessionToken()
    const sessionExpiresAt = new Date(Date.now() + TINY_SESSION_TTL_MS)
    const anonSessionId = crypto.randomUUID()

    await Cache.set(
      `session:tiny:${anonToken}`,
      {
        id: anonSessionId,
        token: anonToken,
        userId: ANONYMOUS_USER_ID,
        permission: 'webrtc-scanner:' + transfer.pollKey,
        expiresAt: sessionExpiresAt.toISOString(),
        createdAt: now.toISOString(),
      },
      { expirationTtl: Math.floor(TINY_SESSION_TTL_MS / 1000) },
    )

    transfer.status = 'claimed'
    transfer.requesterSessionId = anonSessionId
    await Cache.set(`webrtc:transfer:${pollKey}`, transfer, {
      expirationTtl: Math.floor(WEBRTC_OFFER_TTL_MS / 1000),
    })

    return {
      success: true,
      status: 'claimed',
      sessionToken: anonToken,
      message: 'WebRTC offer claimed. Starting peer connection...',
      pollIntervalMs: 5000,
    }
  })

export const statusOffer = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ pollKey: z.string() }))
  .handler(async ({ data: { pollKey } }) => {
    const transfer = await Cache.get<CachedWebrtcTransfer>(
      `webrtc:transfer:${pollKey}`,
    )

    if (transfer && transfer.status === 'connected') {
      return { status: 'connected' }
    }

    return { status: 'waiting' }
  })
