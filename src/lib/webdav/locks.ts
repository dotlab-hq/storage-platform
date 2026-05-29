import { webDavHref } from '@/lib/webdav/path'

export type LockScope = 'exclusive' | 'shared'

export type ActiveWebDavLock = {
  token: string
  bucketName: string
  objectKey: string | null
  rootHref: string
  owner: string
  depth: '0' | 'infinity'
  scope: LockScope
  timeoutSeconds: number
  expiresAt: number
}

const locks = new Map<string, ActiveWebDavLock>()
const DEFAULT_TIMEOUT_SECONDS = 3600
const MAX_TIMEOUT_SECONDS = 86400

function now(): number {
  return Date.now()
}

function pruneLocks(): void {
  const current = now()
  for (const [token, lock] of locks.entries()) {
    if (lock.expiresAt <= current) locks.delete(token)
  }
}

function parseTimeoutSeconds(value: string | null): number {
  if (!value) return DEFAULT_TIMEOUT_SECONDS
  const secondsMatch = value.match(/Second-(\d+)/i)
  if (!secondsMatch) return DEFAULT_TIMEOUT_SECONDS
  const parsed = Number.parseInt(secondsMatch[1], 10)
  if (!Number.isFinite(parsed) || parsed < 1) return DEFAULT_TIMEOUT_SECONDS
  return Math.min(parsed, MAX_TIMEOUT_SECONDS)
}

function pathMatches(lock: ActiveWebDavLock, objectKey: string | null): boolean {
  if (lock.objectKey === objectKey) return true
  if (lock.depth !== 'infinity' || !lock.objectKey || !objectKey) return false
  const prefix = lock.objectKey.endsWith('/') ? lock.objectKey : `${lock.objectKey}/`
  return objectKey.startsWith(prefix)
}

function requestTokens(request: Request): Set<string> {
  const values = [
    request.headers.get('if') ?? '',
    request.headers.get('lock-token') ?? '',
  ].join(' ')
  return new Set(
    Array.from(values.matchAll(/opaquelocktoken:[^>\s)]+/g)).map(
      (match) => match[0],
    ),
  )
}

export function getLocks(
  bucketName: string,
  objectKey: string | null,
): ActiveWebDavLock[] {
  pruneLocks()
  return Array.from(locks.values()).filter(
    (lock) => lock.bucketName === bucketName && pathMatches(lock, objectKey),
  )
}

export function hasConflictingLock(
  request: Request,
  bucketName: string,
  objectKey: string | null,
): boolean {
  const tokens = requestTokens(request)
  return getLocks(bucketName, objectKey).some((lock) => !tokens.has(lock.token))
}

export function createLock(input: {
  request: Request
  bucketName: string
  objectKey: string | null
  owner: string
  depth: '0' | 'infinity'
  scope: LockScope
}): ActiveWebDavLock | 'conflict' {
  pruneLocks()
  const existing = getLocks(input.bucketName, input.objectKey)
  if (input.scope === 'exclusive' && existing.length > 0) return 'conflict'
  if (existing.some((lock) => lock.scope === 'exclusive')) return 'conflict'

  const timeoutSeconds = parseTimeoutSeconds(input.request.headers.get('timeout'))
  const token = `opaquelocktoken:${crypto.randomUUID()}`
  const lock: ActiveWebDavLock = {
    token,
    bucketName: input.bucketName,
    objectKey: input.objectKey,
    rootHref: webDavHref(input.bucketName, input.objectKey),
    owner: input.owner,
    depth: input.depth,
    scope: input.scope,
    timeoutSeconds,
    expiresAt: now() + timeoutSeconds * 1000,
  }
  locks.set(token, lock)
  return lock
}

export function refreshLock(
  request: Request,
  bucketName: string,
  objectKey: string | null,
): ActiveWebDavLock | null {
  pruneLocks()
  const token = requestTokens(request).values().next().value as string | undefined
  if (!token) return null
  const lock = locks.get(token)
  if (!lock) return null
  if (lock.bucketName !== bucketName || lock.objectKey !== objectKey) {
    return null
  }
  const timeoutSeconds = parseTimeoutSeconds(request.headers.get('timeout'))
  const refreshed = {
    ...lock,
    timeoutSeconds,
    expiresAt: now() + timeoutSeconds * 1000,
  }
  locks.set(token, refreshed)
  return refreshed
}

export function unlock(
  request: Request,
  bucketName: string,
  objectKey: string | null,
): boolean {
  pruneLocks()
  const token = request.headers.get('lock-token')?.match(/opaquelocktoken:[^>\s)]+/)?.[0]
  if (!token) return false
  const lock = locks.get(token)
  if (!lock) return false
  if (lock.bucketName !== bucketName || lock.objectKey !== objectKey) return false
  return locks.delete(token)
}
