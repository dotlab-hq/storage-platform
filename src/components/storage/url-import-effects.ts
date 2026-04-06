import * as React from 'react'
import { toast } from '@/components/ui/sonner'
import {
  setUrlImportJobs,
  upsertUrlImportJob,
} from '@/components/storage/url-import-store'
import type { UrlImportJobState } from '@/lib/url-import/types'
import { UrlImportJobRecordSchema } from '@/lib/url-import/types'

export function useUrlImportStatusSync(input: {
  status: unknown
  onImportComplete: () => Promise<void> | void
  invalidateHomeSnapshot: () => Promise<void>
}) {
  React.useEffect(() => {
    const parsed = UrlImportJobRecordSchema.safeParse(input.status)
    if (!parsed.success) {
      return
    }
    const record = parsed.data

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
      userId: record.userId,
      url: record.url,
      method: record.method,
      headers: record.headers,
      cookies: record.cookies,
      savePath: record.savePath,
      parentFolderId: record.parentFolderId,
      status: jobStatus,
      error: record.error,
      queuedAtIso: record.queuedAtIso,
      updatedAtIso: record.updatedAtIso,
    })

    if (jobStatus === 'completed') {
      toast.success('URL import completed')
      void input.onImportComplete()
      void input.invalidateHomeSnapshot()
    }
    if (jobStatus === 'failed') {
      toast.error(record.error ?? 'URL import failed')
    }
  }, [input])
}

export function useUrlImportHistorySync(input: {
  jobs: UrlImportJobState[] | undefined
}) {
  React.useEffect(() => {
    if (!input.jobs) {
      return
    }
    setUrlImportJobs(input.jobs)
  }, [input.jobs])
}
