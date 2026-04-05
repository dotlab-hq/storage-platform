import { createFileRoute } from '@tanstack/react-router'
import { and, eq, gt } from 'drizzle-orm'
import { db } from '@/db'
import { qrLoginOffer, tinySession } from '@/db/schema/auth-schema'
import {
  createTinySessionCookie,
  createTinySessionToken,
  TINY_SESSION_TTL_MS,
} from '@/lib/tiny-session'

export const Route = createFileRoute('/api/qr-auth/poll')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url)
          const pollKey = url.searchParams.get('pollKey')?.trim()
          if (!pollKey) {
            return Response.json(
              { error: 'Missing poll key.' },
              { status: 400 },
            )
          }

          const rows = await db
            .select({
              id: qrLoginOffer.id,
              status: qrLoginOffer.status,
              ownerUserId: qrLoginOffer.ownerUserId,
              requestedPermission: qrLoginOffer.requestedPermission,
              expiresAt: qrLoginOffer.expiresAt,
            })
            .from(qrLoginOffer)
            .where(eq(qrLoginOffer.pollKey, pollKey))
            .limit(1)

          if (rows.length === 0) {
            return Response.json({ status: 'not_found' }, { status: 404 })
          }

          const offer = rows[0]
          const now = new Date()
          if (
            (offer.status === 'pending' || offer.status === 'claimed') &&
            offer.expiresAt.getTime() <= now.getTime()
          ) {
            await db
              .update(qrLoginOffer)
              .set({ status: 'expired' })
              .where(eq(qrLoginOffer.id, offer.id))

            const response = Response.json({
              status: 'expired',
              message: 'QR has expired. Generate new QR.',
              expiresAt: offer.expiresAt.toISOString(),
            })
            return response
          }

          if (offer.status !== 'claimed') {
            return Response.json({
              status: offer.status,
              expiresAt: offer.expiresAt.toISOString(),
            })
          }

          if (!offer.ownerUserId) {
            return Response.json(
              { status: 'invalid', error: 'Owner missing from claimed offer.' },
              { status: 409 },
            )
          }

          const permission =
            offer.requestedPermission === 'read-write' ? 'read-write' : 'read'
          const tinySessionToken = createTinySessionToken()
          const tinySessionExpiresAt = new Date(
            Date.now() + TINY_SESSION_TTL_MS,
          )

          await db.insert(tinySession).values({
            id: crypto.randomUUID(),
            token: tinySessionToken,
            userId: offer.ownerUserId,
            permission,
            sourceOfferId: offer.id,
            expiresAt: tinySessionExpiresAt,
            createdAt: now,
          })

          await db
            .update(qrLoginOffer)
            .set({ status: 'approved' })
            .where(
              and(
                eq(qrLoginOffer.id, offer.id),
                eq(qrLoginOffer.status, 'claimed'),
                gt(qrLoginOffer.expiresAt, now),
              ),
            )

          await db
            .update(qrLoginOffer)
            .set({ status: 'approved', claimedAt: now })
            .where(eq(qrLoginOffer.id, offer.id))

          const response = Response.json({
            status: 'approved',
            permission,
            tinySessionExpiresAt: tinySessionExpiresAt.toISOString(),
          })
          response.headers.append(
            'set-cookie',
            createTinySessionCookie(tinySessionToken),
          )
          return response
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Failed to poll QR login.'
          return Response.json({ error: message }, { status: 500 })
        }
      },
    },
  },
})
