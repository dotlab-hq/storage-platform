import { useCallback, useEffect, useState } from 'react'
import { getUserQuotaSnapshotFn } from '@/lib/server-functions/quota'
import type { UserQuota } from '@/types/storage'

export function useQuota() {
  const [quota, setQuota] = useState<UserQuota | null>(null)

  const load = useCallback(async () => {
    try {
      const q = await getUserQuotaSnapshotFn()
      setQuota(q)
    } catch (err) {
      console.error('[useQuota] Failed to load quota:', err)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return quota
}
