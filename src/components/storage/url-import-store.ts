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
      const nextJobs = [job, ...state.jobs]
        .sort((a, b) => b.updatedAtIso.localeCompare(a.updatedAtIso))
        .slice(0, 100)
      return { ...state, jobs: nextJobs }
    }

    const nextJobs = [...state.jobs]
    nextJobs[index] = job
    nextJobs.sort((a, b) => b.updatedAtIso.localeCompare(a.updatedAtIso))
    return { ...state, jobs: nextJobs.slice(0, 100) }
  })
}

export function setUrlImportJobs(jobs: UrlImportJobState[]): void {
  const sorted = [...jobs]
    .sort((a, b) => b.updatedAtIso.localeCompare(a.updatedAtIso))
    .slice(0, 100)
  urlImportStore.setState((state) => ({ ...state, jobs: sorted }))
}
