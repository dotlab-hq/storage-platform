import { db } from '@/db'
import { userStorage } from '@/db/schema/storage'
import { eq } from 'drizzle-orm'
import { DEFAULT_FILE_SIZE_LIMIT_BYTES } from '@/lib/storage-quota-constants'

export async function getUserFileSizeLimit(userId: string): Promise<number> {
  const storageRows = await db
    .select({ fileSizeLimit: userStorage.fileSizeLimit })
    .from(userStorage)
    .where(eq(userStorage.userId, userId))
    .limit(1)

  return storageRows[0]?.fileSizeLimit ?? DEFAULT_FILE_SIZE_LIMIT_BYTES
}
