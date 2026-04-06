import { Cache } from '@/lib/Cache'

export async function invalidateFolderCache(
  userId: string,
  folderId: string | null,
) {
  const fId = folderId ?? 'root'
  // Invalidate common permutations
  await Promise.all([
    Cache.delete(`items:${userId}:${fId}:p1:l50`),
    Cache.delete(`items:${userId}:${fId}:p1:l100`),
    Cache.delete(`items:${userId}:${fId}:p2:l50`),
    Cache.delete(`items:${userId}:${fId}:p2:l100`),
    Cache.delete(`items:${userId}:${fId}:p3:l50`),
    Cache.delete(`items:${userId}:${fId}:p3:l100`),
  ])
}

export async function invalidateQuotaCache(userId: string) {
  await Cache.delete(`quota:${userId}`)
}
