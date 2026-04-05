import { and, eq, gt, isNull } from 'drizzle-orm'
import { db } from '@/db'
import { qrLoginOffer, tinySession, user } from '@/db/schema/auth-schema'
import { isAdminRole, normalizeUserRole } from '@/lib/authz'

export const TINY_SESSION_COOKIE_NAME = 'tiny_session_token'
export const QR_OFFER_TTL_MS = 60_000
export const QR_POLL_INTERVAL_MS = 5_000
export const TINY_SESSION_TTL_MS = 10 * 60_000
export const QR_PAYLOAD_PREFIX = 'DOT_STORAGE_QR_LOGIN:'

export type TinySessionPermission = 'read' | 'read-write'
export type QrOfferStatus =
  | 'pending'
  | 'claimed'
  | 'approved'
  | 'expired'
  | 'rejected'

export type ResolvedTinySession = {
  sessionId: string
  permission: TinySessionPermission
  expiresAt: Date
  user: {
    id: string
    email: string
    name: string
    role: string
    isAdmin: boolean
  }
}

export function readCookieValue(cookieHeader: string | null, name: string) {
  if (!cookieHeader) return null
  const pairs = cookieHeader.split(';')
  for (const pair of pairs) {
    const [rawName, ...rest] = pair.trim().split('=')
    if (rawName === name) {
      return decodeURIComponent(rest.join('='))
    }
  }
  return null
}

export function createTinySessionCookie(token: string) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  const maxAgeSeconds = Math.floor(TINY_SESSION_TTL_MS / 1000)
  return `${TINY_SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secure}`
}

export function clearTinySessionCookie() {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `${TINY_SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`
}

export function createQrOfferCode() {
  const buffer = new Uint8Array(18)
  crypto.getRandomValues(buffer)
  return Array.from(buffer)
    .map((value) => value.toString(36).padStart(2, '0'))
    .join('')
    .slice(0, 28)
}

export function createPollKey() {
  const buffer = new Uint8Array(24)
  crypto.getRandomValues(buffer)
  return Array.from(buffer)
    .map((value) => value.toString(36).padStart(2, '0'))
    .join('')
    .slice(0, 36)
}

export function createTinySessionToken() {
  const buffer = new Uint8Array(32)
  crypto.getRandomValues(buffer)
  return Array.from(buffer)
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')
}

export function buildQrLoginPayload(code: string) {
  return `${QR_PAYLOAD_PREFIX}${code}`
}

export function parseQrLoginPayload(raw: string) {
  const value = raw.trim()
  if (!value.startsWith(QR_PAYLOAD_PREFIX)) {
    return null
  }
  const code = value.slice(QR_PAYLOAD_PREFIX.length)
  if (!code) {
    return null
  }
  return code
}

export async function resolveTinySessionFromHeaders(
  headers: Headers,
): Promise<ResolvedTinySession | null> {
  const token = readCookieValue(headers.get('cookie'), TINY_SESSION_COOKIE_NAME)
  if (!token) return null

  const now = new Date()
  const rows = await db
    .select({
      sessionId: tinySession.id,
      permission: tinySession.permission,
      expiresAt: tinySession.expiresAt,
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })
    .from(tinySession)
    .innerJoin(user, eq(tinySession.userId, user.id))
    .where(
      and(
        eq(tinySession.token, token),
        isNull(tinySession.revokedAt),
        gt(tinySession.expiresAt, now),
      ),
    )
    .limit(1)

  if (rows.length === 0) {
    return null
  }

  const row = rows[0]
  const role = normalizeUserRole(row.role)

  void db
    .update(tinySession)
    .set({ lastUsedAt: now })
    .where(eq(tinySession.id, row.sessionId))

  return {
    sessionId: row.sessionId,
    permission: row.permission as TinySessionPermission,
    expiresAt: row.expiresAt,
    user: {
      id: row.userId,
      email: row.email,
      name: row.name,
      role,
      isAdmin: isAdminRole(role),
    },
  }
}

export async function expireQrOfferIfNeeded(code: string) {
  const rows = await db
    .select({
      id: qrLoginOffer.id,
      status: qrLoginOffer.status,
      expiresAt: qrLoginOffer.expiresAt,
    })
    .from(qrLoginOffer)
    .where(eq(qrLoginOffer.code, code))
    .limit(1)

  if (rows.length === 0) return null

  const offer = rows[0]
  if (
    offer.expiresAt.getTime() <= Date.now() &&
    (offer.status === 'pending' || offer.status === 'claimed')
  ) {
    await db
      .update(qrLoginOffer)
      .set({ status: 'expired' })
      .where(eq(qrLoginOffer.id, offer.id))
    return { ...offer, status: 'expired' as const }
  }

  return offer
}

export const WEBRTC_OFFER_TTL_MS = 60_000
export const WEBRTC_POLL_INTERVAL_MS = 5_000
export const WEBRTC_TRANSFER_PREFIX = 'DOT_STORAGE_WEBRTC:'

export function createWebrtcOfferCode() {
  const buffer = new Uint8Array(18)
  crypto.getRandomValues(buffer)
  return Array.from(buffer)
    .map((value) => value.toString(36).padStart(2, '0'))
    .join('')
    .slice(0, 28)
}

export function createWebrtcPollKey() {
  const buffer = new Uint8Array(24)
  crypto.getRandomValues(buffer)
  return Array.from(buffer)
    .map((value) => value.toString(36).padStart(2, '0'))
    .join('')
    .slice(0, 36)
}

export function buildWebrtcOfferPayload(code: string) {
  return `${WEBRTC_TRANSFER_PREFIX}${code}`
}

export function parseWebrtcOfferPayload(raw: string) {
  const value = raw.trim()
  if (!value.startsWith(WEBRTC_TRANSFER_PREFIX)) {
    return null
  }
  const code = value.slice(WEBRTC_TRANSFER_PREFIX.length)
  if (!code) {
    return null
  }
  return code
}
