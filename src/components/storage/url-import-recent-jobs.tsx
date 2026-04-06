'use client'

import { useUrlImportStore } from '@/components/storage/url-import-store'

export function UrlImportRecentJobs() {
  const recentJobs = useUrlImportStore((store) => store.jobs)
  if (recentJobs.length === 0) {
    return null
  }

  return (
    <div className="rounded border p-2">
      <p className="mb-1 text-xs font-medium">Recent URL import jobs</p>
      <ul className="space-y-1 text-xs">
        {recentJobs.slice(0, 3).map((job) => (
          <li key={job.jobId}>
            {job.savePath} - {job.status}
            {job.error ? ` (${job.error})` : ''}
          </li>
        ))}
      </ul>
    </div>
  )
}
