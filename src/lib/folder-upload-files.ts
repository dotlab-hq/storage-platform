import {
  computeFilesHashes,
  flattenFileMap,
  uploadSingleFileWithProgress,
} from './folder-upload-core'
import {
  initFolderUpload,
  completeFolderUpload,
  abortFolderUpload,
} from '@/lib/folder-upload-server'
import type { UploadStateUpdater, UploadingFile } from './folder-upload-core'
import type { FolderUploadResult } from './folder-upload-core'

const DEFAULT_FOLDER_FILE_CONCURRENCY = 8
const DEFAULT_FILE_UPLOAD_ATTEMPTS = 3

async function uploadFolderFileWithRetry( args: {
  uploadId: string
  fileName: string
  file: File
  objectKey: string
  setUploads: UploadStateUpdater
  maxAttempts: number
} ): Promise<string | null> {
  const {
    uploadId,
    fileName,
    file,
    objectKey,
    setUploads,
    maxAttempts,
  } = args

  let attempt = 0
  let lastError: string | null = null

  while ( attempt < maxAttempts ) {
    attempt += 1
    try {
      setUploads( ( prev ) =>
        prev.map( ( u ) =>
          u.id === `${uploadId}-${fileName}`
            ? { ...u, status: 'uploading' as const, error: undefined }
            : u,
        ),
      )

      const providerId = await uploadSingleFileWithProgress(
        file,
        objectKey,
        `${uploadId}-${fileName}`,
        setUploads,
        ( progress ) => {
          setUploads( ( prev ) =>
            prev.map( ( u ) =>
              u.id === `${uploadId}-${fileName}` ? { ...u, progress } : u,
            ),
          )
        },
      )

      setUploads( ( prev ) =>
        prev.map( ( u ) =>
          u.id === `${uploadId}-${fileName}`
            ? { ...u, progress: 95, error: undefined }
            : u,
        ),
      )

      return providerId
    } catch ( error ) {
      lastError =
        error instanceof Error ? error.message : 'Folder file upload failed'
      if ( attempt >= maxAttempts ) {
        break
      }
    }
  }

  throw new Error( lastError ?? 'Folder file upload failed' )
}

export async function uploadFolderFromFiles( {
  folderName,
  files,
  userId: _userId,
  parentFolderId,
  setUploads,
  options,
}: {
  folderName: string
  files: Array<{ file: File; relativePath: string }>
  userId: string
  parentFolderId: string | null
  setUploads: UploadStateUpdater
  options?: {
    fileConcurrency?: number
    maxAttempts?: number
  }
} ): Promise<FolderUploadResult> {
  const uploadId = crypto.randomUUID()

  const fileMap = await computeFilesHashes( files )
  const flatFiles = flattenFileMap( fileMap )

  if ( flatFiles.length === 0 ) {
    return { success: false, error: 'No files found in folder' }
  }

  const totalFiles = flatFiles.length
  const totalSize = flatFiles.reduce( ( sum, f ) => sum + f.size, 0 )

  const folderUploadId = `${uploadId}-folder`
  const folderUploadEntry = {
    id: folderUploadId,
    progress: 0,
    status: 'uploading' as const,
    folderName,
    totalFilesCount: totalFiles,
    uploadedFilesCount: 0,
  }

  const childFileEntries: UploadingFile[] = flatFiles.map( ( f ) => ( {
    id: `${uploadId}-${f.name}`,
    file: f.file,
    progress: 0,
    status: 'uploading' as const,
    parentUploadId: folderUploadId,
    targetFolderId: parentFolderId,
  } ) )

  setUploads( ( prev ) => [folderUploadEntry, ...childFileEntries, ...prev] )

  let uploadedObjectKeys: string[] = []
  const providerIdByObjectKey = new Map<string, string | null>()
  let initResponse: {
    uploadSessionId: string
    objectKeys: Record<string, string>
  } | null = null

  try {
    initResponse = await initFolderUpload( {
      data: {
        folderName,
        parentFolderId,
        files: flatFiles.map( ( f ) => ( {
          fileName: f.name,
          fileSize: f.size,
          sha256Hash: f.hash,
        } ) ),
        totalSize,
      },
    } )

    uploadedObjectKeys = flatFiles
      .map( ( f ) => initResponse!.objectKeys[f.name] )
      .filter( ( k ): k is string => typeof k === 'string' )

    let processedCount = 0
    const fileConcurrency = Math.max(
      1,
      Math.min(
        options?.fileConcurrency ?? DEFAULT_FOLDER_FILE_CONCURRENCY,
        flatFiles.length,
      ),
    )
    const maxAttempts = Math.max(
      1,
      options?.maxAttempts ?? DEFAULT_FILE_UPLOAD_ATTEMPTS,
    )
    let cursor = 0

    const worker = async () => {
      while ( cursor < flatFiles.length ) {
        const currentIndex = cursor
        cursor += 1
        const fileData = flatFiles[currentIndex]
        const objectKey = initResponse!.objectKeys[fileData.name]
        if ( !objectKey ) continue

        const providerId = await uploadFolderFileWithRetry( {
          uploadId,
          fileName: fileData.name,
          file: fileData.file,
          objectKey,
          setUploads,
          maxAttempts,
        } )
        providerIdByObjectKey.set( objectKey, providerId )

        processedCount += 1
        const newFolderProgress = Math.round( ( processedCount / totalFiles ) * 100 )
        setUploads( ( prev ) =>
          prev.map( ( u ) =>
            u.id === folderUploadId
              ? {
                ...u,
                uploadedFilesCount: processedCount,
                progress: newFolderProgress,
              }
              : u,
          ),
        )
      }
    }

    await Promise.all( Array.from( { length: fileConcurrency }, () => worker() ) )

    const completeResponse = await completeFolderUpload( {
      data: {
        uploadSessionId: initResponse!.uploadSessionId,
        folderName,
        parentFolderId,
        files: flatFiles.map( ( f ) => {
          const completedObjectKey = initResponse!.objectKeys[f.name]
          return {
            fileName: f.file.name,
            objectKey: completedObjectKey,
            sha256Hash: f.hash,
            fileSize: f.file.size,
            mimeType: f.file.type || null,
            providerId: providerIdByObjectKey.get( completedObjectKey ) ?? null,
          }
        } ),
        providerId: undefined,
      },
    } )

    setUploads( ( prev ) =>
      prev.map( ( u ) =>
        u.parentUploadId === folderUploadId
          ? { ...u, progress: 100, status: 'completed' as const }
          : u,
      ),
    )

    setUploads( ( prev ) =>
      prev.map( ( u ) =>
        u.id === folderUploadId
          ? { ...u, status: 'completed' as const, progress: 100 }
          : u,
      ),
    )

    return {
      success: true,
      folderId: completeResponse.folderId,
      folderName,
      filesCount: completeResponse.filesCount,
    }
  } catch ( err ) {
    const errorMessage =
      err instanceof Error ? err.message : 'Folder upload failed'

    if ( initResponse?.uploadSessionId ) {
      try {
        await abortFolderUpload( {
          data: {
            uploadSessionId: initResponse.uploadSessionId,
            objectKeys: uploadedObjectKeys,
          },
        } )
      } catch {
        // Best effort cleanup
      }
    }

    for ( const fileData of flatFiles ) {
      setUploads( ( prev ) =>
        prev.map( ( u ) =>
          u.id === `${uploadId}-${fileData.name}`
            ? { ...u, status: 'failed' as const, error: errorMessage }
            : u,
        ),
      )
    }

    setUploads( ( prev ) =>
      prev.map( ( u ) =>
        u.id === folderUploadId
          ? {
            ...u,
            status: 'failed' as const,
            progress: 100,
            uploadedFilesCount: totalFiles,
            error: errorMessage,
          }
          : u,
      ),
    )

    return { success: false, error: errorMessage }
  }
}
