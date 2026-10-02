import { useState } from 'react'
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { toast } from '@/components/ui/sonner'
import { bucketsQuery } from '@/lib/s3-buckets/queries'
import { S3_QUERY_KEYS } from '@/lib/query-keys'
import type { S3BucketCredentials, S3BucketItem } from '@/types/s3-buckets'
import type { PendingByBucket } from '@/hooks/use-s3-buckets.helpers'
import {
  bucketActionRequest,
  createBucketRequest,
  fetchCredentialsRequest,
  rotateCredentialsRequest,
} from '@/hooks/use-s3-buckets.mutations'
import type { BucketAction } from '@/hooks/use-s3-buckets.mutations'

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

/**
 * Bucket list (preloaded by the /buckets loader) plus its mutations. Create
 * and delete update the list optimistically, roll back on error, and refetch
 * once settled.
 */
export function useS3Buckets() {
  const queryClient = useQueryClient()
  const { data: buckets } = useSuspenseQuery(bucketsQuery())
  const [pendingByBucket, setPendingByBucket] = useState<PendingByBucket>({})
  const [credentialByBucket, setCredentialByBucket] = useState<
    Record<string, S3BucketCredentials | undefined>
  >({})

  const setPending = (bucketName: string, action: BucketAction | undefined) =>
    setPendingByBucket((previous) => ({ ...previous, [bucketName]: action }))

  const saveCredentials = (credentials: S3BucketCredentials) =>
    setCredentialByBucket((previous) => ({
      ...previous,
      [credentials.bucket]: credentials,
    }))

  /** Cancels in-flight list fetches and snapshots the list for rollback. */
  const prepareOptimisticUpdate = async () => {
    await queryClient.cancelQueries({ queryKey: S3_QUERY_KEYS.buckets })
    return queryClient.getQueryData<S3BucketItem[]>(S3_QUERY_KEYS.buckets)
  }

  const refreshBuckets = () =>
    queryClient.invalidateQueries({ queryKey: S3_QUERY_KEYS.buckets })

  const createMutation = useMutation({
    mutationFn: (bucketName: string) => createBucketRequest(bucketName),
    onMutate: async (bucketName) => {
      const previous = await prepareOptimisticUpdate()
      const placeholder: S3BucketItem = {
        id: `temp-${crypto.randomUUID()}`,
        name: bucketName,
        mappedFolderId: null,
        isActive: true,
        isDefault: false,
        createdAt: new Date().toISOString(),
      }
      queryClient.setQueryData<S3BucketItem[]>(
        S3_QUERY_KEYS.buckets,
        (list) => [placeholder, ...(list ?? [])],
      )
      return { previous }
    },
    onError: (error, _bucketName, context) => {
      queryClient.setQueryData(S3_QUERY_KEYS.buckets, context?.previous)
      toast.error(errorMessage(error, 'Failed to create bucket'))
    },
    onSettled: refreshBuckets,
  })

  const actionMutation = useMutation({
    mutationFn: (input: { bucketName: string; action: BucketAction }) =>
      bucketActionRequest(input.bucketName, input.action),
    onMutate: async ({ bucketName, action }) => {
      setPending(bucketName, action)
      const previous = await prepareOptimisticUpdate()
      if (action === 'delete') {
        queryClient.setQueryData<S3BucketItem[]>(
          S3_QUERY_KEYS.buckets,
          (list) => list?.filter((bucket) => bucket.name !== bucketName),
        )
      }
      return { previous }
    },
    onSuccess: (_data, { bucketName, action }) => {
      toast.success(
        action === 'empty' ? `Emptied ${bucketName}` : `Deleted ${bucketName}`,
      )
    },
    onError: (error, { action }, context) => {
      queryClient.setQueryData(S3_QUERY_KEYS.buckets, context?.previous)
      toast.error(errorMessage(error, `Failed to ${action} bucket`))
    },
    onSettled: (_data, _error, { bucketName }) => {
      setPending(bucketName, undefined)
      void queryClient.invalidateQueries({
        queryKey: S3_QUERY_KEYS.bucket(bucketName),
      })
      return refreshBuckets()
    },
  })

  const credentialsMutation = useMutation({
    mutationFn: fetchCredentialsRequest,
    onSuccess: saveCredentials,
    onError: (error) =>
      toast.error(errorMessage(error, 'Failed to fetch credentials')),
  })

  const rotateMutation = useMutation({
    mutationFn: rotateCredentialsRequest,
    onSuccess: saveCredentials,
    onError: (error) =>
      toast.error(errorMessage(error, 'Failed to rotate credentials')),
  })

  return {
    buckets,
    defaultBucket: buckets.find((bucket) => bucket.isDefault),
    isCreating: createMutation.isPending,
    pendingByBucket,
    credentialByBucket,
    refreshBuckets,
    /** Resolves to true when the bucket was created. */
    createBucket: (bucketName: string) =>
      createMutation
        .mutateAsync(bucketName.trim())
        .then(() => true)
        .catch(() => false),
    runBucketAction: (bucketName: string, action: BucketAction) => {
      actionMutation.mutate({ bucketName, action })
    },
    /** Resolves to the credentials, or null when the request failed. */
    fetchCredentials: (bucketName: string) =>
      credentialsMutation.mutateAsync(bucketName).catch(() => null),
    rotateCredentials: (bucketName: string) =>
      rotateMutation.mutateAsync(bucketName).catch(() => null),
  }
}
