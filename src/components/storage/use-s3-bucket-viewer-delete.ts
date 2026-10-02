import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { InfiniteData } from '@tanstack/react-query'
import { toast } from '@/components/ui/sonner'
import { deleteS3ViewerObjectFn } from '@/lib/storage/mutations/s3-viewer-rpc'
import { S3_QUERY_KEYS } from '@/lib/query-keys'
import type { S3ListResponse } from '@/components/storage/s3-viewer-types'

/**
 * Deletes an object from the current prefix: hides it from the listing right
 * away, restores it and toasts if the delete fails, then refetches.
 */
export function useS3ViewerDelete(bucketName: string, prefix: string) {
  const queryClient = useQueryClient()
  const queryKey = S3_QUERY_KEYS.bucketItems(bucketName, prefix)

  const deleteMutation = useMutation({
    mutationFn: (objectKey: string) =>
      deleteS3ViewerObjectFn({ data: { bucketName, objectKey } }),
    onMutate: async (objectKey) => {
      await queryClient.cancelQueries({ queryKey })
      const previous =
        queryClient.getQueryData<InfiniteData<S3ListResponse>>(queryKey)
      queryClient.setQueryData<InfiniteData<S3ListResponse>>(
        queryKey,
        (data) =>
          data
            ? {
                ...data,
                pages: data.pages.map((page) => ({
                  ...page,
                  objects: page.objects.filter(
                    (item) => item.key !== objectKey,
                  ),
                })),
              }
            : data,
      )
      return { previous }
    },
    onError: (error, _objectKey, context) => {
      queryClient.setQueryData(queryKey, context?.previous)
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete object',
      )
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })

  return {
    deleteFile: (objectKey: string) => deleteMutation.mutate(objectKey),
    isDeleting: deleteMutation.isPending,
  }
}
