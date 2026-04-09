import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { Cache } from '@/lib/Cache'
import type { CachedTinySession } from '@/lib/tiny-session'

const SIGNAL_TTL_SECONDS = 30
const SIGNAL_TTL_MS = SIGNAL_TTL_SECONDS * 1000
const MAX_SIGNAL_QUEUE_SIZE = 50

type StoredSignalRecord = {
  id: string
  signal: string
  createdAt: string
  expiresAt: string
}

type StoredSignalQueue = {
  items: StoredSignalRecord[]
}

const SessionSignalSchema = z.object({
  sessionToken: z.string().min(1),
})

const SetSignalSchema = z.object({
  sessionToken: z.string().min(1),
  signal: z.string().min(1),
})

function parseWebrtcPermission(permission: string | undefined) {
  if (!permission) {
    return null
  }

  if (permission.startsWith('webrtc-owner:')) {
    const pollKey = permission.slice('webrtc-owner:'.length)
    return {
      ownPermission: permission,
      peerPermission: `webrtc-scanner:${pollKey}`,
    }
  }

  if (permission.startsWith('webrtc-scanner:')) {
    const pollKey = permission.slice('webrtc-scanner:'.length)
    return {
      ownPermission: permission,
      peerPermission: `webrtc-owner:${pollKey}`,
    }
  }

  return null
}

function isSessionExpired(session: CachedTinySession) {
  return new Date(session.expiresAt).getTime() <= Date.now()
}

async function loadSessionOrThrow(sessionToken: string) {
  const session = await Cache.get<CachedTinySession>(
    `session:tiny:${sessionToken}`,
  )
  if (!session || isSessionExpired(session)) {
    throw new Error('Invalid or expired tiny session.')
  }
  return session
}

function resolveSignalKey(permission: string, direction: 'in' | 'out') {
  return `webrtc:signal:${permission}:${direction}`
}

function isSignalRecordValid(record: StoredSignalRecord, nowMs: number) {
  if (record.signal.length === 0) {
    return false
  }

  const expiresAtMs = new Date(record.expiresAt).getTime()
  return expiresAtMs > nowMs
}

async function readSignalQueue(signalKey: string) {
  const queue = await Cache.get<StoredSignalQueue>(signalKey)
  if (!queue || !Array.isArray(queue.items)) {
    return [] as StoredSignalRecord[]
  }

  const nowMs = Date.now()
  return queue.items.filter((record) => isSignalRecordValid(record, nowMs))
}

async function writeSignalQueue(
  signalKey: string,
  items: StoredSignalRecord[],
) {
  if (items.length === 0) {
    await Cache.delete(signalKey)
    return
  }

  await Cache.set(signalKey, { items }, { expirationTtl: SIGNAL_TTL_SECONDS })
}

export const getSignalServerFn = createServerFn({ method: 'GET' })
  .inputValidator(SessionSignalSchema)
  .handler(async ({ data }) => {
    const session = await loadSessionOrThrow(data.sessionToken)
    const permissions = parseWebrtcPermission(session.permission)

    if (!permissions) {
      return { hasSignal: false, signal: null as string | null }
    }

    const incomingKey = resolveSignalKey(permissions.ownPermission, 'in')
    const queue = await readSignalQueue(incomingKey)
    if (queue.length === 0) {
      return { hasSignal: false, signal: null as string | null }
    }

    const [nextSignal, ...remaining] = queue
    await writeSignalQueue(incomingKey, remaining)

    return {
      hasSignal: true,
      signal: nextSignal.signal,
    }
  })

export const setSignalServerFn = createServerFn({ method: 'POST' })
  .inputValidator(SetSignalSchema)
  .handler(async ({ data }) => {
    const session = await loadSessionOrThrow(data.sessionToken)
    const permissions = parseWebrtcPermission(session.permission)

    if (!permissions) {
      throw new Error('Tiny session is not a WebRTC transfer session.')
    }

    const now = new Date()
    const expiresAt = new Date(now.getTime() + SIGNAL_TTL_MS)
    const signalRecord: StoredSignalRecord = {
      id: crypto.randomUUID(),
      signal: data.signal,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    }

    const outgoingKey = resolveSignalKey(permissions.ownPermission, 'out')
    const incomingKey = resolveSignalKey(permissions.peerPermission, 'in')

    const [outgoingQueue, incomingQueue] = await Promise.all([
      readSignalQueue(outgoingKey),
      readSignalQueue(incomingKey),
    ])

    const nextOutgoingQueue = [...outgoingQueue, signalRecord].slice(
      -MAX_SIGNAL_QUEUE_SIZE,
    )
    const nextIncomingQueue = [...incomingQueue, signalRecord].slice(
      -MAX_SIGNAL_QUEUE_SIZE,
    )

    await Promise.all([
      writeSignalQueue(outgoingKey, nextOutgoingQueue),
      writeSignalQueue(incomingKey, nextIncomingQueue),
    ])

    return { success: true }
  })
