import {
  useMutation,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useCallback, useMemo, useRef, useState } from 'react'
import {
  createS3ViewerFolderFn,
  createS3ViewerPresignUrlFn,
  deleteS3ViewerObjectFn,
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

interface S3ListResponse {
  prefix: string
  keyCount: number
  isTruncated: boolean
  nextContinuationToken: string | null
  folders: { name: string; prefix: string }[]
  objects: {
    key: string
    name: string
    sizeInBytes: number
    eTag: string | null
    lastModified: string | null
  }[]
}

export function useS3BucketViewer( bucketName: string ) {
  const queryClient = useQueryClient()
  const [prefix, setPrefix] = useState( '' )
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>( [] )
  const inputRef = useRef<HTMLInputElement | null>( null )

  const queryKey = useMemo(
    () => ['s3-viewer', bucketName, prefix],
    [bucketName, prefix],
  )

  // Main infinite query for listing objects with pagination
  const query = useInfiniteQuery<S3ListResponse>( {
    queryKey,
    enabled: !!bucketName,
    initialPageParam: null as string | null,
    queryFn: async ( { pageParam } ) => {
      const params = new URLSearchParams()
      params.append( 'bucketName', bucketName )
      params.append( 'maxKeys', '500' )
      if ( prefix ) {
        params.append( 'prefix', prefix )
      }
      if ( pageParam ) {
        params.append( 'continuationToken', pageParam )
      }
      const res = await fetch( `/api/storage/s3/bucket-items?${params}`, {
        credentials: 'include',
      } )
      if ( !res.ok ) {
        const err = await res
          .json()
          .then( ( d: Record<string, unknown> ) => d.error )
          .catch( () => 'Failed to load bucket content' )
        throw new Error( err as string )
      }
      return res.json()
    },
    getNextPageParam: ( lastPage ) =>
      lastPage.isTruncated ? lastPage.nextContinuationToken : undefined,
    staleTime: 30_000,
  } )

  // Merge folders across pages (dedup by prefix)
  const folders = useMemo<S3ViewerFolderEntry[]>( () => {
    const seen = new Set<string>()
    const merged: S3ListResponse['folders'] = []
    for ( const page of query.data?.pages ?? [] ) {
      for ( const folder of page.folders ) {
        if ( !seen.has( folder.prefix ) ) {
          seen.add( folder.prefix )
          merged.push( folder )
        }
      }
    }
    return merged
  }, [query.data?.pages] )

  // Merge files across pages (dedup by key)
  const files = useMemo<S3ViewerFileEntry[]>( () => {
    const seen = new Set<string>()
    const merged: S3ListResponse['objects'] = []
    for ( const page of query.data?.pages ?? [] ) {
      for ( const file of page.objects ) {
        if ( !seen.has( file.key ) ) {
          seen.add( file.key )
          merged.push( file )
        }
      }
    }
    return merged
  }, [query.data?.pages] )

  const breadcrumbs = useMemo( () => {
    const parts = prefix.split( '/' ).filter( ( part ) => part.length > 0 )
    return parts.map( ( part, index ) => ( {
      label: part,
      value: `${parts.slice( 0, index + 1 ).join( '/' )}/`,
    } ) )
  }, [prefix] )

  const refresh = useCallback(
    async ( nextPrefix?: string ) => {
      const targetPrefix = typeof nextPrefix === 'string' ? nextPrefix : prefix
      if ( targetPrefix !== prefix ) {
        setPrefix( targetPrefix )
      } else {
        await query.refetch()
      }
    },
    [prefix, query],
  )

  const loadMore = useCallback( async () => {
    if ( query.hasNextPage && !query.isFetchingNextPage ) {
      await query.fetchNextPage()
    }
  }, [query] )

  // Upload mutation with multipart presigned URLs and progress
  const uploadMutation = useMutation( {
    mutationFn: async ( {
      file,
      uploadingId,
    }: {
      file: File
      uploadingId: string
    } ) => {
      const objectKey = `${prefix}${file.name}`
      await uploadFileWithMultipartPresignedUrl( {
        bucketName,
        objectKey,
        file,
        onProgress: ( progress ) => {
          setUploadingFiles( ( prev ) =>
            prev.map( ( item ) =>
              item.id === uploadingId ? { ...item, progress } : item,
            ),
          )
        },
      } )
      return { uploadingId }
    },
    onMutate: ( { file, uploadingId } ) => {
      setUploadingFiles( ( prev ) => [
        ...prev,
        {
          id: uploadingId,
          name: file.name,
          sizeInBytes: file.size,
          progress: 0,
          status: 'uploading',
        },
      ] )
    },
    onSuccess: ( { uploadingId } ) => {
      setUploadingFiles( ( prev ) =>
        prev.map( ( f ) =>
          f.id === uploadingId
            ? { ...f, status: 'completed', progress: 100 }
            : f,
        ),
      )
      setTimeout( () => {
        setUploadingFiles( ( prev ) => prev.filter( ( f ) => f.id !== uploadingId ) )
      }, 2000 )
      queryClient.invalidateQueries( { queryKey } )
    },
    onError: ( error, { uploadingId } ) => {
      setUploadingFiles( ( prev ) =>
        prev.map( ( f ) =>
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
  } )

  const handleUpload = useCallback(
    async ( event: React.ChangeEvent<HTMLInputElement> ) => {
      const file = event.target.files?.[0]
      if ( !file ) return
      const uploadingId = `${Date.now()}-${file.name}`
      try {
        await uploadMutation.mutateAsync( { file, uploadingId } )
      } finally {
        event.target.value = ''
      }
    },
    [uploadMutation],
  )

  // Create folder mutation
  const createFolderMutation = useMutation( {
    mutationFn: async ( folderName: string ) => {
      const result = await createS3ViewerFolderFn( {
        data: { bucketName, objectKey: `${prefix}${folderName}/` },
      } )
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries( { queryKey } )
    },
  } )

  const createFolder = useCallback( async () => {
    const folderName = window.prompt( 'Folder name' )?.trim()
    if ( !folderName ) return
    await createFolderMutation.mutateAsync( folderName )
  }, [createFolderMutation] )

  // Delete mutation
  const deleteMutation = useMutation( {
    mutationFn: async ( objectKey: string ) => {
      await deleteS3ViewerObjectFn( { data: { bucketName, objectKey } } )
    },
    onSuccess: () => {
      queryClient.invalidateQueries( { queryKey } )
    },
  } )

  const deleteFile = useCallback(
    async ( key: string ) => {
      if ( !window.confirm( `Delete ${key}?` ) ) return
      await deleteMutation.mutateAsync( key )
    },
    [deleteMutation],
  )

  // Open file with presigned URL
  const openFile = useCallback(
    async ( key: string ) => {
      try {
        const result = await createS3ViewerPresignUrlFn( {
          data: { bucketName, objectKey: key, expiresInSeconds: 900 },
        } )
        window.open( result.url, '_blank', 'noopener,noreferrer' )
      } catch ( error ) {
        console.error( 'Failed to open file:', error )
      }
    },
    [bucketName],
  )

  const busy =
    query.isFetching ||
    uploadMutation.isPending ||
    createFolderMutation.isPending ||
    deleteMutation.isPending

  const message = query.error
    ? query.error instanceof Error
      ? query.error.message
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
    loadMore,
    handleUpload,
    createFolder,
    deleteFile,
    openFile,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
  }
}
