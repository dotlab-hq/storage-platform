import { createFileRoute } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { webrtcTransfer } from '@/db/schema/auth-schema'

export const Route = createFileRoute('/api/webrtc-transfer/status')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const rows = await db
            .select({ status: webrtcTransfer.status })
            .from(webrtcTransfer)
            .where(eq(webrtcTransfer.status, 'connected'))
            .limit(1)

          if (rows.length > 0) {
            return Response.json({ status: 'connected' })
          }

          return Response.json({ status: 'waiting' })
        } catch {
          return Response.json({ status: 'error' }, { status: 500 })
        }
      },
    },
  },
})
