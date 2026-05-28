import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useRef, useState } from 'react'
import { uploadFileWithMultipartPresignedUrl } from '@/components/storage/s3-viewer-upload'
import type { UploadingFile } from '@/components/storage/s3-viewer-types'

type UseS3ViewerUploadParams = {
  bucketName: string
  prefix: string
  queryKey: unknown[]
}

export function useS3ViewerUpload({
  bucketName,
  prefix,
  queryKey,
}: UseS3ViewerUploadParams) {
  const queryClient = useQueryClient()
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const inputRef = useRef<HTMLInputElement | null>(null)

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
      setUploadingFiles((prev) =>
        prev.map((f) =>
          f.id === uploadingId
            ? { ...f, status: 'completed', progress: 100 }
            : f,
        ),
      )
      setTimeout(() => {
        setUploadingFiles((prev) => prev.filter((f) => f.id !== uploadingId))
      }, 2000)
      queryClient.invalidateQueries({ queryKey })
    },
    onError: (error, { uploadingId }) => {
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
      const uploadingId = crypto.randomUUID()
      try {
        await uploadMutation.mutateAsync({ file, uploadingId })
      } finally {
        event.target.value = ''
      }
    },
    [uploadMutation],
  )

  return {
    inputRef,
    uploadingFiles,
    handleUpload,
    uploadMutation,
  }
}
