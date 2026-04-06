import * as React from 'react'
import { toast } from '@/components/ui/sonner'
import { upsertUrlImportJob } from '@/components/storage/url-import-store'

export function useUrlImportStatusSync(input: {
  status: unknown
  onImportComplete: () => Promise<void> | void
  invalidateHomeSnapshot: () => Promise<void>
}) {
  React.useEffect(() => {
    const status = input.status
    if (!status || typeof status !== 'object') {
      return
    }
    const record = status as Record<string, unknown>
    if (
      typeof record.jobId !== 'string' ||
      typeof record.status !== 'string' ||
      typeof record.error === 'undefined' ||
      typeof record.url !== 'string' ||
      typeof record.savePath !== 'string' ||
      typeof record.queuedAtIso !== 'string'
    ) {
      return
    }

    const jobStatus = record.status
    if (
      jobStatus !== 'queued' &&
      jobStatus !== 'running' &&
      jobStatus !== 'failed' &&
      jobStatus !== 'completed'
    ) {
      return
    }

    upsertUrlImportJob({
      jobId: record.jobId,
      url: record.url,
      savePath: record.savePath,
      status: jobStatus,
      error: typeof record.error === 'string' ? record.error : null,
      queuedAtIso: record.queuedAtIso,
    })

    if (jobStatus === 'completed') {
      toast.success('URL import completed')
      void input.onImportComplete()
      void input.invalidateHomeSnapshot()
    }
    if (jobStatus === 'failed') {
      const errorText = typeof record.error === 'string' ? record.error : null
      toast.error(errorText ?? 'URL import failed')
    }
  }, [input])
}
