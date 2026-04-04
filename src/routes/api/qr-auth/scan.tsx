import { createFileRoute } from '@tanstack/react-router'
import { and, eq, gt, inArray, isNull } from 'drizzle-orm'
import { db } from '@/db'
import { qrLoginOffer } from '@/db/schema/auth-schema'
import { getAuthenticatedUser } from '@/lib/server-auth'
import { parseQrLoginPayload } from '@/lib/tiny-session'

const REQUEST_PERMISSION_VALUES = ['read', 'read-write'] as const
const CLAIMABLE_STATUSES = ['pending'] as const

export const Route = createFileRoute('/api/qr-auth/scan')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const scanner = await getAuthenticatedUser()
          const body = (await request.json().catch(() => null)) as {
            payload?: string
            requestedPermission?: string
          } | null

          const payload = body?.payload?.trim() ?? ''
          const code = parseQrLoginPayload(payload)
          if (!code) {
            return Response.json(
              { error: 'Invalid QR payload.' },
              { status: 400 },
            )
          }

          const requestedPermission = REQUEST_PERMISSION_VALUES.includes(
            body?.requestedPermission as (typeof REQUEST_PERMISSION_VALUES)[number],
          )
            ? (body?.requestedPermission as 'read' | 'read-write')
            : 'read'

          const now = new Date()
          const rows = await db
            .select({
              id: qrLoginOffer.id,
              status: qrLoginOffer.status,
              expiresAt: qrLoginOffer.expiresAt,
            })
            .from(qrLoginOffer)
            .where(eq(qrLoginOffer.code, code))
            .limit(1)

          if (rows.length === 0) {
            return Response.json(
              { error: 'QR offer not found.' },
              { status: 404 },
            )
          }

          const offer = rows[0]

          if (offer.expiresAt.getTime() <= now.getTime()) {
            await db
              .update(qrLoginOffer)
              .set({ status: 'expired' })
              .where(eq(qrLoginOffer.id, offer.id))
            return Response.json({ error: 'QR has expired.' }, { status: 410 })
          }

          if (!CLAIMABLE_STATUSES.includes(offer.status as 'pending')) {
            return Response.json(
              { error: 'QR offer is no longer claimable.' },
              { status: 409 },
            )
          }

          await db
            .update(qrLoginOffer)
            .set({
              status: 'claimed',
              ownerUserId: scanner.id,
              claimedByUserId: scanner.id,
              requestedPermission,
            })
            .where(
              and(
                eq(qrLoginOffer.id, offer.id),
                inArray(
                  qrLoginOffer.status,
                  CLAIMABLE_STATUSES as unknown as string[],
                ),
                isNull(qrLoginOffer.claimedByUserId),
                gt(qrLoginOffer.expiresAt, now),
              ),
            )

          const freshRows = await db
            .select({
              id: qrLoginOffer.id,
              status: qrLoginOffer.status,
              ownerUserId: qrLoginOffer.ownerUserId,
              claimedByUserId: qrLoginOffer.claimedByUserId,
              requestedPermission: qrLoginOffer.requestedPermission,
              expiresAt: qrLoginOffer.expiresAt,
            })
            .from(qrLoginOffer)
            .where(eq(qrLoginOffer.id, offer.id))
            .limit(1)

          const current = freshRows[0]
          if (!current || current.claimedByUserId !== scanner.id) {
            return Response.json(
              { error: 'QR was claimed by another device.' },
              { status: 409 },
            )
          }

          return Response.json({
            offerId: current.id,
            status: current.status,
            expiresAt: current.expiresAt.toISOString(),
            requestedPermission: current.requestedPermission,
          })
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Failed to scan QR.'
          const status = /Unauthorized/i.test(message) ? 401 : 500
          return Response.json({ error: message }, { status })
        }
      },
    },
  },
})
