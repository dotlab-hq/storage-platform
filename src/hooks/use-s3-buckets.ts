import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  S3BucketCredentials,
  S3BucketListResponse,
} from '@/types/s3-buckets'
import {
  parseJson,
  readApiError,
  type PendingByBucket,
} from '@/hooks/use-s3-buckets.helpers'
import {
  createBucketWithOptimisticUpdate,
  mutateBucketAction,
  requestBucketCredentials,
} from '@/hooks/use-s3-buckets.mutations'

const BUCKETS_QUERY_KEY = ['s3-buckets'] as const

export function useS3Buckets() {
  const queryClient = useQueryClient()
  const [pendingByBucket, setPendingByBucket] = useState<PendingByBucket>({})
  const [credentialByBucket, setCredentialByBucket] = useState<
    Record<string, S3BucketCredentials | undefined>
  >({})
  const [error, setError] = useState<string | null>(null)

  const bucketsQuery = useQuery({
    queryKey: BUCKETS_QUERY_KEY,
    queryFn: async () => {
      const response = await fetch('/api/storage/s3/buckets', { method: 'GET' })
      if (!response.ok) {
        throw new Error(await readApiError(response, 'Failed to load buckets'))
      }
      const payload = await parseJson<S3BucketListResponse>(response)
      return payload.buckets
    },
  })

  const createMutation = useMutation({
    mutationFn: async (bucketName: string) =>
      createBucketWithOptimisticUpdate(queryClient, setError, bucketName),
  })

  const actionMutation = useMutation({
    mutationFn: async (input: {
      bucketName: string
      action: 'empty' | 'delete'
    }) =>
      mutateBucketAction(
        queryClient,
        setError,
        (bucketName, pending) => {
          setPendingByBucket((previous) => ({
            ...previous,
            [bucketName]: pending,
          }))
        },
        input.bucketName,
        input.action,
      ),
  })

  const credentialsMutation = useMutation({
    mutationFn: async (bucketName?: string) =>
      requestBucketCredentials(
        setError,
        (name, credentials) => {
          setCredentialByBucket((previous) => ({
            ...previous,
            [name]: credentials,
          }))
        },
        bucketName,
      ),
  })

  const buckets = bucketsQuery.data ?? []
  const defaultBucket = useMemo(
    () => buckets.find((bucket) => bucket.isDefault),
    [buckets],
  )

  return {
    buckets,
    defaultBucket,
    isLoading: bucketsQuery.isLoading,
    isRefreshing: bucketsQuery.isFetching,
    isCreating: createMutation.isPending,
    pendingByBucket,
    credentialByBucket,
    error,
    hasBuckets: buckets.length > 0,
    refreshBuckets: bucketsQuery.refetch,
    createNewBucket: async (bucketName: string) => {
      const result = await createMutation.mutateAsync(bucketName)
      return result.ok
    },
    runBucketAction: async (bucketName: string, action: 'empty' | 'delete') => {
      const result = await actionMutation.mutateAsync({ bucketName, action })
      return result.ok
    },
    fetchCredentials: async (bucketName?: string) => {
      try {
        return await credentialsMutation.mutateAsync(bucketName)
      } catch {
        return null
      }
    },
  }
}
