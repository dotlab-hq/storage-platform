import { useInfiniteQuery } from '@tanstack/react-query'
import { toast } from '@/components/ui/sonner'
import { createS3ViewerPresignUrlFn } from '@/lib/storage/mutations/s3-viewer-rpc'
import { bucketItemsQuery, flattenBucketPages } from '@/lib/s3-buckets/queries'
import { useS3ViewerUpload } from '@/components/storage/use-s3-bucket-viewer-upload'
import { useS3ViewerFolder } from '@/components/storage/use-s3-bucket-viewer-folder'
import { useS3ViewerDelete } from '@/components/storage/use-s3-bucket-viewer-delete'

/** Breadcrumb segments for a prefix: 'a/b/' => [{a, 'a/'}, {b, 'a/b/'}]. */
function prefixBreadcrumbs(prefix: string) {
  const parts = prefix.split('/').filter((part) => part.length > 0)
  return parts.map((part, index) => ({
    label: part,
    value: `${parts.slice(0, index + 1).join('/')}/`,
  }))
}

/**
 * State and actions for browsing one prefix of a bucket. The listing uses
 * `bucketItemsQuery`, which the bucket route preloads in its loader, so the
 * page renders with data; the viewer modal shows inline placeholders instead.
 */
export function useS3BucketViewer(
  bucketName: string,
  prefix: string,
  onPrefixChange: (prefix: string) => void,
) {
  const query = useInfiniteQuery(bucketItemsQuery(bucketName, prefix))
  const { folders, files } = flattenBucketPages(query.data)
  const upload = useS3ViewerUpload(bucketName, prefix)
  const folder = useS3ViewerFolder(bucketName, prefix)
  const remove = useS3ViewerDelete(bucketName, prefix)

  const openFile = async (key: string) => {
    try {
      const result = await createS3ViewerPresignUrlFn({
        data: { bucketName, objectKey: key, expiresInSeconds: 900 },
      })
      window.open(result.url, '_blank', 'noopener,noreferrer')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to open file',
      )
    }
  }

  const loadMore = () => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      void query.fetchNextPage()
    }
  }

  return {
    inputRef: upload.inputRef,
    folders,
    files,
    uploadingFiles: upload.uploadingFiles,
    breadcrumbs: prefixBreadcrumbs(prefix),
    busy: upload.isUploading || folder.isCreatingFolder || remove.isDeleting,
    isLoading: query.isPending,
    isRefetching: query.isRefetching,
    errorMessage: query.error ? query.error.message : null,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    refresh: (nextPrefix?: string) => {
      if (nextPrefix === undefined) void query.refetch()
      else onPrefixChange(nextPrefix)
    },
    loadMore,
    handleUpload: upload.handleUpload,
    dismissUpload: upload.dismissUpload,
    createFolder: folder.createFolder,
    deleteFile: remove.deleteFile,
    openFile,
  }
}

export type S3BucketViewerState = ReturnType<typeof useS3BucketViewer>
