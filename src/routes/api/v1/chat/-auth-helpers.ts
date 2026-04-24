import { db } from '@/db'
import { user, apikey } from '@/db/schema/auth-schema'
import { eq } from 'drizzle-orm'

export function hasChatCompletionsScope(permissions: string | null): boolean {
  if (!permissions) {
    return false
  }

  try {
    const parsed = JSON.parse(permissions) as unknown
    if (!Array.isArray(parsed)) {
      return false
    }

    return parsed.some(
      (value): value is string =>
        typeof value === 'string' && value === 'chat:completions',
    )
  } catch {
    return false
  }
}

export async function getUserFromApiKey(
  headers: Headers,
): Promise<{ id: string; email: string; name: string } | null> {
  const authHeader = headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.slice(7)
  if (!token) {
    return null
  }

  try {
    const keyRow = await db.query.apikey.findFirst({
      where: eq(apikey.key, token),
    })

    if (!keyRow) return null
    if (keyRow.expiresAt && new Date(keyRow.expiresAt) < new Date()) return null
    if (keyRow.enabled === false) return null
    if (!hasChatCompletionsScope(keyRow.permissions)) return null

    const userRow = await db.query.user.findFirst({
      where: eq(user.id, keyRow.userId),
    })

    if (!userRow) return null

    return {
      id: userRow.id,
      email: userRow.email,
      name: userRow.name ?? 'API User',
    }
  } catch {
    return null
  }
}
