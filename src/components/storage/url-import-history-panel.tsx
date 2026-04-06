'use client'

import { Button } from '@/components/ui/button'
import { useUrlImportHistory } from '@/components/storage/use-url-import-history'

export function UrlImportHistoryPanel() {
  const { jobs, isLoading, retryMutation } = useUrlImportHistory()

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Loading history...</p>
  }

  if (jobs.length === 0) {
    return <p className="text-muted-foreground text-sm">No import jobs yet.</p>
  }

  return (
    <div className="space-y-2">
      {jobs.map((job) => (
        <div key={job.jobId} className="rounded border p-2 text-xs">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium">{job.savePath}</p>
            <span className="text-muted-foreground">{job.status}</span>
          </div>
          <p className="text-muted-foreground truncate">{job.url}</p>
          <p className="text-muted-foreground">
            {new Date(job.updatedAtIso).toLocaleString()}
          </p>
          {job.error && <p className="text-destructive">{job.error}</p>}
          <div className="mt-2 flex justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => retryMutation.mutate(job.jobId)}
              disabled={retryMutation.isPending}
            >
              Retry
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
