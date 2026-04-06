import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { Cache } from '@/lib/Cache'
import type { CachedTinySession } from '@/lib/tiny-session'

const SIGNAL_TTL_MS = 30_000

export const getSignalServerFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      sessionToken: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const { sessionToken } = data

    const session = await Cache.get<CachedTinySession>(
      `session:tiny:${sessionToken}`,
    )

    if (!session || new Date(session.expiresAt).getTime() <= Date.now()) {
      throw new Error('Invalid or expired tiny session.')
    }

    let targetPermission: string | null = null
    let pollKey: string | null = null

    if (session.permission?.startsWith('webrtc-owner:')) {
      pollKey = session.permission.replace('webrtc-owner:', '')
      targetPermission = 'webrtc-scanner:' + pollKey
    } else if (session.permission?.startsWith('webrtc-scanner:')) {
      pollKey = session.permission.replace('webrtc-scanner:', '')
      targetPermission = 'webrtc-owner:' + pollKey
    }

    let peerSignal: string | null = null

    if (pollKey && targetPermission) {
      // we need to get the signal from the peer session.
      // Since we don't have secondary indices, let's fetch the poll transfer object
      // and use it to store signals, or we can store signals in a separate key.
      const signalData = await Cache.get<{ signal: string; expiresAt: string }>(
        `webrtc:signal:${targetPermission}`,
      )

      if (signalData && new Date(signalData.expiresAt).getTime() > Date.now()) {
        peerSignal = signalData.signal
      }
    } else if (session.sourceOfferId) {
      // old QR login logic - we can store QR signals similarly
      const signalData = await Cache.get<{ signal: string; expiresAt: string }>(
        `qr:signal:${session.sourceOfferId}:peer`,
      )
      if (signalData && new Date(signalData.expiresAt).getTime() > Date.now()) {
        peerSignal = signalData.signal
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

    const session = await Cache.get<CachedTinySession>(
      `session:tiny:${sessionToken}`,
    )

    if (!session || new Date(session.expiresAt).getTime() <= Date.now()) {
      throw new Error('Invalid or expired tiny session.')
    }

    const expiresAt = new Date(Date.now() + SIGNAL_TTL_MS)

    // update session in cache
    await Cache.set(
      `session:tiny:${sessionToken}`,
      {
        ...session,
        webrtcSignal: signal,
        webrtcSignalExpiresAt: expiresAt.toISOString(),
      },
      { expirationTtl: Math.floor(SIGNAL_TTL_MS / 1000) },
    )

    // Also store it by permission for easy lookup by peer
    if (session.permission) {
      await Cache.set(
        `webrtc:signal:${session.permission}`,
        { signal, expiresAt: expiresAt.toISOString() },
        { expirationTtl: Math.floor(SIGNAL_TTL_MS / 1000) },
      )
    } else if (session.sourceOfferId) {
      await Cache.set(
        `qr:signal:${session.sourceOfferId}`,
        { signal, expiresAt: expiresAt.toISOString() },
        { expirationTtl: Math.floor(SIGNAL_TTL_MS / 1000) },
      )
    }

    return { success: true }
  })
