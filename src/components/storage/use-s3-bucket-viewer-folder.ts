import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createS3ViewerFolderFn } from '@/lib/storage/mutations/s3-viewer-rpc'
import { S3_QUERY_KEYS } from '@/lib/query-keys'

/**
 * Creates a folder inside the current prefix. `createFolder` rejects on
 * failure so the new-folder dialog can stay open and show the error.
 */
export function useS3ViewerFolder(bucketName: string, prefix: string) {
  const queryClient = useQueryClient()
  const createFolderMutation = useMutation({
    mutationFn: (folderName: string) =>
      createS3ViewerFolderFn({
        data: { bucketName, objectKey: `${prefix}${folderName}/` },
      }),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: S3_QUERY_KEYS.bucketItems(bucketName, prefix),
      }),
  })

  return {
    createFolder: async (folderName: string) => {
      await createFolderMutation.mutateAsync(folderName)
    },
    isCreatingFolder: createFolderMutation.isPending,
  }
}
