import { useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createS3ViewerFolderFn } from '@/lib/storage/mutations/s3-viewer-rpc'

type UseS3ViewerFolderParams = {
  bucketName: string
  prefix: string
  queryKey: unknown[]
}

export function useS3ViewerFolder({
  bucketName,
  prefix,
  queryKey,
}: UseS3ViewerFolderParams) {
  const queryClient = useQueryClient()
  const createFolderMutation = useMutation({
    mutationFn: async (folderName: string) => {
      return createS3ViewerFolderFn({
        data: { bucketName, objectKey: `${prefix}${folderName}/` },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const createFolder = useCallback(async () => {
    const folderName = window.prompt('Folder name')?.trim()
    if (!folderName) return
    await createFolderMutation.mutateAsync(folderName)
  }, [createFolderMutation])

  return { createFolder, createFolderMutation }
}
