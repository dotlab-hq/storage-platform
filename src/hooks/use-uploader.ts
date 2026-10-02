import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCurrentUser } from '@/lib/auth/current-user'
import { quotaQuery } from '@/lib/storage/folder-query'
import { uploadFiles, uploadFolders } from '@/lib/storage/upload-service'
import type { UploadContext } from '@/lib/storage/upload-service'
import type { FolderUploadSource } from '@/lib/drop-upload-classifier'

/** Upload functions bound to the signed-in user and a target folder. */
export function useUploader(folderId: string | null) {
  const queryClient = useQueryClient()
  const user = useCurrentUser()
  const { data: quota } = useQuery(quotaQuery())
  const fileSizeLimit = quota?.fileSizeLimit ?? null

  const getContext = useCallback(
    (): UploadContext => ({
      userId: user.id,
      folderId,
      fileSizeLimit,
      queryClient,
    }),
    [user.id, folderId, fileSizeLimit, queryClient],
  )

  return {
    fileSizeLimit,
    readOnly: user.readOnly,
    uploadFiles: useCallback(
      (files: File[]) => uploadFiles(files, getContext()),
      [getContext],
    ),
    uploadFolders: useCallback(
      (sources: FolderUploadSource[]) => uploadFolders(sources, getContext()),
      [getContext],
    ),
  }
}
