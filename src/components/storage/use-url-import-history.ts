import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/ui/sonner'
import {
  createUrlImportJobFn,
  getUrlImportHistoryFn,
} from '@/lib/url-import/server'
import { useUrlImportHistorySync } from '@/components/storage/url-import-effects'

export function useUrlImportHistory() {
  const queryClient = useQueryClient()

  const historyQuery = useQuery({
    queryKey: ['url-import-history'],
    queryFn: async () => getUrlImportHistoryFn(),
    refetchInterval: 3000,
  })

  useUrlImportHistorySync({ jobs: historyQuery.data })

  const retryMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const jobs = historyQuery.data ?? []
      const job = jobs.find((candidate) => candidate.jobId === jobId)
      if (!job) {
        throw new Error('Job not found in history')
      }

      return createUrlImportJobFn({
        data: {
          url: job.url,
          method: job.method,
          headers: job.headers,
          cookies: job.cookies,
          savePath: job.savePath,
          parentFolderId: job.parentFolderId,
        },
      })
    },
    onSuccess: async () => {
      toast.success('Retry queued')
      await queryClient.invalidateQueries({ queryKey: ['url-import-history'] })
      await queryClient.invalidateQueries({ queryKey: ['home-snapshot'] })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Retry failed')
    },
  })

  return {
    jobs: historyQuery.data ?? [],
    isLoading: historyQuery.isLoading,
    retryMutation,
  }
}
