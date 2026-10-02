import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import { toast } from '@/components/ui/sonner'
import { uploadFileWithMultipartPresignedUrl } from '@/components/storage/s3-viewer-upload'
import type { UploadingFile } from '@/components/storage/s3-viewer-types'
import { S3_QUERY_KEYS } from '@/lib/query-keys'

const COMPLETED_UPLOAD_LINGER_MS = 2000

/**
 * Uploads a file into the current prefix of a bucket. In-flight uploads are
 * listed with progress; failed ones stay listed (marked failed) until the
 * user dismisses them.
 */
export function useS3ViewerUpload(bucketName: string, prefix: string) {
  const queryClient = useQueryClient()
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const inputRef = useRef<HTMLInputElement | null>(null)

  const updateUpload = (id: string, patch: Partial<UploadingFile>) =>
    setUploadingFiles((previous) =>
      previous.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    )

  const dismissUpload = (id: string) =>
    setUploadingFiles((previous) => previous.filter((item) => item.id !== id))

  const uploadMutation = useMutation({
    mutationFn: ({ file, uploadingId }: { file: File; uploadingId: string }) =>
      uploadFileWithMultipartPresignedUrl({
        bucketName,
        objectKey: `${prefix}${file.name}`,
        file,
        onProgress: (progress) => updateUpload(uploadingId, { progress }),
      }),
    onMutate: ({ file, uploadingId }) => {
      setUploadingFiles((previous) => [
        ...previous,
        {
          id: uploadingId,
          name: file.name,
          sizeInBytes: file.size,
          progress: 0,
          status: 'uploading',
        },
      ])
    },
    onSuccess: (_result, { uploadingId }) => {
      updateUpload(uploadingId, { status: 'completed', progress: 100 })
      setTimeout(() => dismissUpload(uploadingId), COMPLETED_UPLOAD_LINGER_MS)
    },
    onError: (error, { file, uploadingId }) => {
      const message = error instanceof Error ? error.message : 'Upload failed'
      updateUpload(uploadingId, { status: 'error', errorMessage: message })
      toast.error(`Failed to upload ${file.name}: ${message}`)
    },
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: S3_QUERY_KEYS.bucketItems(bucketName, prefix),
      }),
  })

  /** Change handler for the hidden file input. */
  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    uploadMutation.mutate({ file, uploadingId: crypto.randomUUID() })
  }

  return {
    inputRef,
    uploadingFiles,
    handleUpload,
    dismissUpload,
    isUploading: uploadMutation.isPending,
  }
}
