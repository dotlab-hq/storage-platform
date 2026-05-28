import { useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  BucketSettingsPayload,
  BucketSettingsUpdate,
} from '@/components/storage/bucket-settings-types'

function applyOptimisticUpdate(
  previous: BucketSettingsPayload,
  update: BucketSettingsUpdate,
): BucketSettingsPayload {
  switch (update.action) {
    case 'versioning':
      return { ...previous, versioning: update.state }
    case 'acl':
      return { ...previous, acl: update.cannedAcl }
    case 'public-access':
      return {
        ...previous,
        bucket: { ...previous.bucket, blockPublicAccess: update.blockPublicAccess },
      }
    case 'policy':
      return { ...previous, policyJson: update.policyJson }
    case 'cors':
      return { ...previous, corsRules: update.rules }
  }
}

async function updateBucketSettings(payload: BucketSettingsUpdate) {
  const response = await fetch('/api/storage/s3/bucket-settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    const body: { error?: string } = await response.json()
    throw new Error(body.error ?? 'Update failed')
  }
}

export function useBucketSettingsMutation(bucketName: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateBucketSettings,
    onMutate: async (payload) => {
      await queryClient.cancelQueries({
        queryKey: ['bucket-settings', bucketName],
      })
      const previous = queryClient.getQueryData<BucketSettingsPayload>([
        'bucket-settings',
        bucketName,
      ])
      if (!previous) {
        return { previous }
      }

      queryClient.setQueryData<BucketSettingsPayload>(
        ['bucket-settings', bucketName],
        applyOptimisticUpdate(previous, payload),
      )

      return { previous }
    },
    onError: (_error, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ['bucket-settings', bucketName],
          context.previous,
        )
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['bucket-settings', bucketName],
      })
    },
  })
}
