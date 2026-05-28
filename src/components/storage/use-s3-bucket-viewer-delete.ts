import { useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteS3ViewerObjectFn } from '@/lib/storage/mutations/s3-viewer-rpc'

type UseS3ViewerDeleteParams = {
  bucketName: string
  queryKey: unknown[]
}

export function useS3ViewerDelete({
  bucketName,
  queryKey,
}: UseS3ViewerDeleteParams) {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: async (objectKey: string) => {
      await deleteS3ViewerObjectFn({ data: { bucketName, objectKey } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Failed to delete object'
      console.error('Failed to delete object:', message)
    },
  })

  const deleteFile = useCallback(
    async (key: string) => {
      await deleteMutation.mutateAsync(key)
    },
    [deleteMutation],
  )

  return { deleteFile, deleteMutation }
}
