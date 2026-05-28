import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createS3ViewerPresignUrlFn } from '@/lib/storage/mutations/s3-viewer-rpc'
import type { S3ListResponse } from '@/components/storage/s3-viewer-types'
import { useS3ViewerQuery } from '@/components/storage/use-s3-bucket-viewer-query'
import { useS3ViewerUpload } from '@/components/storage/use-s3-bucket-viewer-upload'
import { useS3ViewerFolder } from '@/components/storage/use-s3-bucket-viewer-folder'
import { useS3ViewerDelete } from '@/components/storage/use-s3-bucket-viewer-delete'

type S3BucketViewerOptions = {
  initialPrefix?: string
  initialData?: S3ListResponse
}

export function useS3BucketViewer(
  bucketName: string,
  options?: S3BucketViewerOptions,
) {
  const [prefix, setPrefix] = useState(options?.initialPrefix ?? '')
  const skipFirstLoadRef = useRef(Boolean(options?.initialData))

  useEffect(() => {
    if (skipFirstLoadRef.current) {
      skipFirstLoadRef.current = false
    }
  }, [])

  const queryState = useS3ViewerQuery({
    bucketName,
    prefix,
    setPrefix,
    initialData: options?.initialData,
    skipFirstLoad: skipFirstLoadRef.current,
  })

  const uploadState = useS3ViewerUpload({
    bucketName,
    prefix,
    queryKey: queryState.queryKey,
  })
  const folderState = useS3ViewerFolder({
    bucketName,
    prefix,
    queryKey: queryState.queryKey,
  })
  const deleteState = useS3ViewerDelete({
    bucketName,
    queryKey: queryState.queryKey,
  })

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
    queryState.query.isFetching ||
    uploadState.uploadMutation.isPending ||
    folderState.createFolderMutation.isPending ||
    deleteState.deleteMutation.isPending

  const message = useMemo(() => {
    if (queryState.query.error) {
      return queryState.query.error instanceof Error
        ? queryState.query.error.message
        : 'Failed to load bucket content'
    }
    if (uploadState.uploadMutation.error) {
      return uploadState.uploadMutation.error instanceof Error
        ? uploadState.uploadMutation.error.message
        : 'Upload failed'
    }
    if (folderState.createFolderMutation.error) {
      return folderState.createFolderMutation.error instanceof Error
        ? folderState.createFolderMutation.error.message
        : 'Failed to create folder'
    }
    if (deleteState.deleteMutation.error) {
      return deleteState.deleteMutation.error instanceof Error
        ? deleteState.deleteMutation.error.message
        : 'Delete failed'
    }
    return null
  }, [
    queryState.query.error,
    uploadState.uploadMutation.error,
    folderState.createFolderMutation.error,
    deleteState.deleteMutation.error,
  ])

  return {
    inputRef: uploadState.inputRef,
    prefix,
    folders: queryState.folders,
    files: queryState.files,
    uploadingFiles: uploadState.uploadingFiles,
    busy,
    message,
    breadcrumbs: queryState.breadcrumbs,
    setPrefix,
    refresh: queryState.refresh,
    loadMore: queryState.loadMore,
    handleUpload: uploadState.handleUpload,
    createFolder: folderState.createFolder,
    deleteFile: deleteState.deleteFile,
    openFile,
    isLoading: queryState.query.isLoading,
    isFetchingNextPage: queryState.query.isFetchingNextPage,
    hasNextPage: queryState.query.hasNextPage,
  }
}
