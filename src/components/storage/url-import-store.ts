import { Store } from '@tanstack/store'
import { useStore } from '@tanstack/react-store'
import type { UrlImportJobState } from '@/lib/url-import/types'

type UrlImportState = {
  jobs: UrlImportJobState[]
}

export const urlImportStore = new Store<UrlImportState>({
  jobs: [],
})

export const useUrlImportStore = <T>(
  selector: (state: UrlImportState) => T,
): T => useStore(urlImportStore, selector)

export function upsertUrlImportJob(job: UrlImportJobState): void {
  urlImportStore.setState((state) => {
    const index = state.jobs.findIndex(
      (candidate) => candidate.jobId === job.jobId,
    )
    if (index === -1) {
      return { ...state, jobs: [job, ...state.jobs].slice(0, 20) }
    }

    const nextJobs = [...state.jobs]
    nextJobs[index] = job
    return { ...state, jobs: nextJobs }
  })
}
