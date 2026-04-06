import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useRef, useState } from 'react'
import {
  createS3ViewerFolderFn,
  createS3ViewerPresignUrlFn,
  deleteS3ViewerObjectFn,
  listS3ViewerObjectsFn,
} from '@/lib/storage/mutations/s3-viewer'
import { uploadFileWithMultipartPresignedUrl } from '@/components/storage/s3-viewer-upload'
import type {
  S3ViewerFileEntry,
  S3ViewerFolderEntry,
} from '@/components/storage/s3-bucket-viewer-cards'

export type UploadingFile = {
  id: string
  name: string
  sizeInBytes: number
  progress: number
  status: 'uploading' | 'completed' | 'error'
  errorMessage?: string
}

export function useS3BucketViewer(bucketName: string) {
  const queryClient = useQueryClient()
  const [prefix, setPrefix] = useState('')
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const inputRef = useRef<HTMLInputElement | null>(null)

  const queryKey = useMemo(
    () => ['s3-viewer', bucketName, prefix],
    [bucketName, prefix],
  )

  // Main query for listing objects - auto-loads on mount and when prefix changes
  const listQuery = useQuery({
    queryKey,
    queryFn: async () => {
      const result = await listS3ViewerObjectsFn({
        data: { bucketName, prefix, maxKeys: 500 },
      })
      return result
    },
    staleTime: 30_000, // 30 seconds
  })

  const folders = useMemo<S3ViewerFolderEntry[]>(
    () => listQuery.data?.folders ?? [],
    [listQuery.data?.folders],
  )

  const files = useMemo<S3ViewerFileEntry[]>(
    () => listQuery.data?.objects ?? [],
    [listQuery.data?.objects],
  )

  const breadcrumbs = useMemo(() => {
    const parts = prefix.split('/').filter((part) => part.length > 0)
    return parts.map((part, index) => ({
      label: part,
      value: `${parts.slice(0, index + 1).join('/')}/`,
    }))
  }, [prefix])

  const refresh = useCallback(
    async (nextPrefix?: string) => {
      const targetPrefix = typeof nextPrefix === 'string' ? nextPrefix : prefix
      if (targetPrefix !== prefix) {
        setPrefix(targetPrefix)
      } else {
        await listQuery.refetch()
      }
    },
    [prefix, listQuery],
  )

  // Upload mutation with multipart presigned URLs and progress
  const uploadMutation = useMutation({
    mutationFn: async ({
      file,
      uploadingId,
    }: {
      file: File
      uploadingId: string
    }) => {
      const objectKey = `${prefix}${file.name}`

      await uploadFileWithMultipartPresignedUrl({
        bucketName,
        objectKey,
        file,
        onProgress: (progress) => {
          setUploadingFiles((prev) =>
            prev.map((item) =>
              item.id === uploadingId ? { ...item, progress } : item,
            ),
          )
        },
      })

      return { uploadingId }
    },
    onMutate: ({ file, uploadingId }) => {
      // Add to uploading files list
      setUploadingFiles((prev) => [
        ...prev,
        {
          id: uploadingId,
          name: file.name,
          sizeInBytes: file.size,
          progress: 0,
          status: 'uploading',
        },
      ])
    },
    onSuccess: ({ uploadingId }) => {
      // Update uploading file status
      setUploadingFiles((prev) =>
        prev.map((f) =>
          f.id === uploadingId
            ? { ...f, status: 'completed', progress: 100 }
            : f,
        ),
      )

      // Remove from uploading files after a delay
      setTimeout(() => {
        setUploadingFiles((prev) => prev.filter((f) => f.id !== uploadingId))
      }, 2000)

      // Invalidate the query to refresh the list
      queryClient.invalidateQueries({ queryKey })
    },
    onError: (error, { uploadingId }) => {
      // Update uploading file status to error
      setUploadingFiles((prev) =>
        prev.map((f) =>
          f.id === uploadingId
            ? {
                ...f,
                status: 'error',
                errorMessage:
                  error instanceof Error ? error.message : 'Upload failed',
              }
            : f,
        ),
      )
    },
  })

  const handleUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      const uploadingId = `${Date.now()}-${file.name}`

      try {
        await uploadMutation.mutateAsync({ file, uploadingId })
      } finally {
        // Clear input
        event.target.value = ''
      }
    },
    [uploadMutation],
  )

  // Create folder mutation
  const createFolderMutation = useMutation({
    mutationFn: async (folderName: string) => {
      const result = await createS3ViewerFolderFn({
        data: {
          bucketName,
          objectKey: `${prefix}${folderName}/`,
        },
      })
      return result
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

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (objectKey: string) => {
      await deleteS3ViewerObjectFn({
        data: { bucketName, objectKey },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const deleteFile = useCallback(
    async (key: string) => {
      if (!window.confirm(`Delete ${key}?`)) return
      await deleteMutation.mutateAsync(key)
    },
    [deleteMutation],
  )

  // Open file with presigned URL
  const openFile = useCallback(
    async (key: string) => {
      try {
        const result = await createS3ViewerPresignUrlFn({
          data: { bucketName, objectKey: key, expiresInSeconds: 900 },
        })
        window.open(result.url, '_blank', 'noopener,noreferrer')
      } catch (error) {
        console.error('Failed to open file:', error)
      }
    },
    [bucketName],
  )

  const busy =
    listQuery.isLoading ||
    uploadMutation.isPending ||
    createFolderMutation.isPending ||
    deleteMutation.isPending

  const message = listQuery.error
    ? listQuery.error instanceof Error
      ? listQuery.error.message
      : 'Failed to load bucket content'
    : uploadMutation.error
      ? uploadMutation.error instanceof Error
        ? uploadMutation.error.message
        : 'Upload failed'
      : createFolderMutation.error
        ? createFolderMutation.error instanceof Error
          ? createFolderMutation.error.message
          : 'Failed to create folder'
        : deleteMutation.error
          ? deleteMutation.error instanceof Error
            ? deleteMutation.error.message
            : 'Delete failed'
          : null

  return {
    inputRef,
    prefix,
    folders,
    files,
    uploadingFiles,
    busy,
    message,
    breadcrumbs,
    setPrefix,
    refresh,
    handleUpload,
    createFolder,
    deleteFile,
    openFile,
    isLoading: listQuery.isLoading,
  }
}
