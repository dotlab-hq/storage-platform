import {
  uploadMultipartInit,
  uploadMultipartComplete,
  registerFile,
} from './upload-server'
import { prepareUploadTarget } from './upload-target-server'
import {
  updateUpload,
  uploadStore,
} from '@/lib/stores/upload-store'

const MIN_PART_SIZE_BYTES = 5 * 1024 * 1024
const MAX_MULTIPART_PARTS = 10000
const TARGET_PART_COUNT = 8
const MIN_MULTIPART_FILE_SIZE_BYTES = 8 * 1024 * 1024
const SINGLE_FILE_PART_CONCURRENCY = 8
const DEFAULT_UPLOAD_ATTEMPTS = 3

export type CompletedFileInfo = {
  id: string
  name: string
  mimeType: string | null
  sizeInBytes: number
  objectKey: string
  createdAt: Date
}

type UploadTarget =
  | { uploadMethod: 'direct'; providerId: string | null; presignedUrl: string }
  | { uploadMethod: 'proxy'; providerId: string | null; uploadUrl: string }

function toErrorMessage( error: unknown, fallback: string ): string {
  return error instanceof Error ? error.message : fallback
}

async function fetchUploadTarget(
  objectKey: string,
  contentType: string,
  fileSize: number,
): Promise<UploadTarget> {
  try {
    const data = await prepareUploadTarget( {
      data: { objectKey, contentType, fileSize },
    } )
    if ( data.uploadMethod === 'proxy' ) {
      return {
        uploadMethod: 'proxy',
        providerId: data.providerId ?? null,
        uploadUrl: data.uploadUrl,
      }
    }

    return {
      uploadMethod: 'direct',
      providerId: data.providerId ?? null,
      presignedUrl: data.presignedUrl,
    }
  } catch ( error: unknown ) {
    throw new Error( toErrorMessage( error, 'Failed to prepare upload target' ) )
  }
}

async function fetchMultipartSession(
  objectKey: string,
  contentType: string,
  fileSize: number,
  partCount: number,
  providerId: string | null,
): Promise<{
  uploadId: string
  providerId: string | null
  partUrls: { partNumber: number; presignedUrl: string }[]
}> {
  try {
    const data = await uploadMultipartInit( {
      data: { objectKey, contentType, fileSize, partCount, providerId },
    } )
    return {
      uploadId: data.uploadId,
      providerId: data.providerId ?? null,
      partUrls: data.partUrls,
    }
  } catch ( error: unknown ) {
    throw new Error(
      toErrorMessage( error, 'Failed to initialize multipart upload' ),
    )
  }
}

async function completeMultipartUpload(
  objectKey: string,
  uploadId: string,
  providerId: string | null,
): Promise<void> {
  try {
    await uploadMultipartComplete( {
      data: { objectKey, uploadId, providerId },
    } )
  } catch ( error: unknown ) {
    throw new Error(
      toErrorMessage( error, 'Failed to finalize multipart upload' ),
    )
  }
}

function computePartSize( fileSize: number ): number {
  return Math.max(
    MIN_PART_SIZE_BYTES,
    Math.ceil( fileSize / TARGET_PART_COUNT ),
    Math.ceil( fileSize / MAX_MULTIPART_PARTS ),
  )
}

function uploadPartWithXhr(
  presignedUrl: string,
  chunk: Blob,
  onPartProgress: ( loadedBytes: number ) => void,
): Promise<void> {
  return new Promise<void>( ( resolve, reject ) => {
    const xhr = new XMLHttpRequest()

    xhr.upload.onprogress = ( e ) => {
      if ( e.lengthComputable ) {
        onPartProgress( e.loaded )
      }
    }

    xhr.onload = () => {
      if ( xhr.status >= 200 && xhr.status < 300 ) {
        onPartProgress( chunk.size )
        resolve()
      } else {
        reject( new Error( `Multipart upload part failed: HTTP ${xhr.status}` ) )
      }
    }

    xhr.onerror = () =>
      reject( new Error( 'Network error during multipart upload' ) )
    xhr.open( 'PUT', presignedUrl )
    xhr.send( chunk )
  } )
}

async function uploadFileMultipart(
  file: File,
  objectKey: string,
  contentType: string,
  providerId: string | null,
  onProgress: ( progress: number ) => void,
): Promise<string | null> {
  const partSize = computePartSize( file.size )
  const partCount = Math.ceil( file.size / partSize )

  const {
    uploadId,
    providerId: multipartProviderId,
    partUrls,
  } = await fetchMultipartSession(
    objectKey,
    contentType,
    file.size,
    partCount,
    providerId,
  )

  const sortedPartUrls = [...partUrls].sort(
    ( a, b ) => a.partNumber - b.partNumber,
  )
  if ( sortedPartUrls.length !== partCount ) {
    throw new Error(
      'Multipart upload initialization returned an unexpected number of part URLs',
    )
  }

  const loadedByPart = new Array<number>( partCount ).fill( 0 )
  let totalLoaded = 0
  let nextPartIndex = 0

  const uploadWorker = async () => {
    while ( true ) {
      const currentIndex = nextPartIndex
      nextPartIndex += 1
      if ( currentIndex >= partCount ) {
        break
      }

      const partNumber = currentIndex + 1
      const start = currentIndex * partSize
      const end = Math.min( start + partSize, file.size )
      const chunk = file.slice( start, end )
      const presignedUrl = sortedPartUrls[currentIndex]?.presignedUrl

      if ( !presignedUrl ) {
        throw new Error( `Missing presigned URL for part ${partNumber}` )
      }

      await uploadPartWithXhr( presignedUrl, chunk, ( loadedBytes ) => {
        totalLoaded += loadedBytes - loadedByPart[currentIndex]
        loadedByPart[currentIndex] = loadedBytes
        onProgress( Math.min( 99, Math.round( ( totalLoaded / file.size ) * 100 ) ) )
      } )
    }
  }

  const workerCount = Math.min( SINGLE_FILE_PART_CONCURRENCY, partCount )
  await Promise.all( Array.from( { length: workerCount }, () => uploadWorker() ) )

  await completeMultipartUpload( objectKey, uploadId, multipartProviderId )
  onProgress( 100 )
  return multipartProviderId
}

async function uploadFileViaProxy(
  uploadUrl: string,
  providerId: string | null,
  objectKey: string,
  file: File,
  contentType: string,
  onProgress: ( progress: number ) => void,
): Promise<string | null> {
  const total = file.size
  let loaded = 0

  const progressTransform = new TransformStream( {
    transform( chunk: Uint8Array, controller ) {
      loaded += chunk.byteLength
      onProgress( Math.round( ( loaded / total ) * 100 ) )
      controller.enqueue( chunk )
    },
  } )

  const bodyStream = file.stream().pipeThrough( progressTransform )

  const response = await fetch( uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Type': contentType,
      'X-Upload-Object-Key': objectKey,
      'X-Upload-File-Size': String( file.size ),
      'X-Upload-Provider-Id': providerId ?? '',
    },
    body: bodyStream,
    duplex: 'half',
  } )

  if ( !response.ok ) {
    const errorBody = await response.text()
    throw new Error(
      `Proxy upload failed: HTTP ${response.status} - ${errorBody}`,
    )
  }

  return providerId
}

/**
 * Register an uploaded file in the database.
 * Returns the newly-created file record.
 */
async function registerFileInDb(
  fileName: string,
  objectKey: string,
  mimeType: string,
  fileSize: number,
  parentFolderId: string | null,
  providerId: string | null,
): Promise<CompletedFileInfo> {
  try {
    const data = await registerFile( {
      data: {
        fileName,
        objectKey,
        mimeType,
        fileSize,
        parentFolderId,
        providerId,
      },
    } )
    if ( !data.file ) {
      throw new Error( 'Failed to register file' )
    }
    return {
      id: data.file.id,
      name: data.file.name,
      mimeType: data.file.mimeType,
      sizeInBytes: data.file.sizeInBytes,
      objectKey: data.file.objectKey,
      createdAt: new Date(),
    }
  } catch ( error: unknown ) {
    throw new Error( toErrorMessage( error, 'Failed to register file' ) )
  }
}

/**
 * Upload a single file directly to S3 using a presigned URL.
 * Returns the registered file record for optimistic UI updates.
 */
export async function uploadFileToS3(
  file: File,
  userId: string,
  folderId: string | null,
  onProgress: ( progress: number ) => void,
): Promise<CompletedFileInfo> {
  if ( !userId ) {
    throw new Error( 'User ID is required for upload' )
  }

  const dotIndex = file.name.lastIndexOf( '.' )
  const base =
    ( dotIndex > 0 ? file.name.slice( 0, dotIndex ) : file.name )
      .replace( /\s+/g, '_' )
      .replace( /[^a-zA-Z0-9._-]/g, '' ) || 'file'
  const ext =
    dotIndex > 0
      ? `.${file.name.slice( dotIndex + 1 ).replace( /[^a-zA-Z0-9]/g, '' )}`
      : ''
  const objectKey = `${userId}/${crypto.randomUUID()}-${base}${ext}`
  const contentType = file.type || 'application/octet-stream'

  const uploadTarget = await fetchUploadTarget(
    objectKey,
    contentType,
    file.size,
  )
  let providerId: string | null

  if ( uploadTarget.uploadMethod === 'proxy' ) {
    providerId = await uploadFileViaProxy(
      uploadTarget.uploadUrl,
      uploadTarget.providerId,
      objectKey,
      file,
      contentType,
      onProgress,
    )
  } else if ( file.size >= MIN_MULTIPART_FILE_SIZE_BYTES ) {
    providerId = await uploadFileMultipart(
      file,
      objectKey,
      contentType,
      uploadTarget.providerId,
      onProgress,
    )
  } else {
    providerId = uploadTarget.providerId
    await new Promise<void>( ( resolve, reject ) => {
      const xhr = new XMLHttpRequest()

      xhr.upload.onprogress = ( e ) => {
        if ( e.lengthComputable ) {
          onProgress( Math.round( ( e.loaded / e.total ) * 100 ) )
        }
      }

      xhr.onload = () => {
        if ( xhr.status >= 200 && xhr.status < 300 ) {
          resolve()
        } else {
          reject( new Error( `S3 upload failed: HTTP ${xhr.status}` ) )
        }
      }

      xhr.onerror = () => reject( new Error( 'Network error during S3 upload' ) )
      xhr.open( 'PUT', uploadTarget.presignedUrl )
      xhr.setRequestHeader( 'Content-Type', contentType )
      xhr.send( file )
    } )
  }

  // Step 3: Register file in database and return file info
  return registerFileInDb(
    file.name,
    objectKey,
    contentType,
    file.size,
    folderId,
    providerId,
  )
}

/**
 * Upload a batch of files with a concurrency limit (default 3).
 * Progress / status updates are pushed to the global upload store.
 * Calls onFileUploaded after each successful upload for optimistic UI.
 * Returns the number of successfully uploaded files.
 */
export async function uploadBatch(
  files: { id: string; file: File }[],
  userId: string,
  folderId: string | null,
  concurrency: number,
  onFileUploaded?: ( file: CompletedFileInfo ) => void,
): Promise<number> {
  let completed = 0
  const queue = [...files]

  const runTaskWithRetry = async (
    task: { id: string; file: File },
    maxAttempts: number,
  ) => {
    let attempt = 0
    let lastError = 'Upload failed'

    while ( attempt < maxAttempts ) {
      attempt += 1

      try {
        updateUpload( task.id, {
          status: 'uploading',
          error: undefined,
          progress: 0,
        } )

        const fileInfo = await uploadFileToS3(
          task.file,
          userId,
          folderId,
          ( progress ) => {
            updateUpload( task.id, { progress } )
          },
        )

        updateUpload( task.id, { progress: 100, status: 'completed' } )
        onFileUploaded?.( fileInfo )
        completed++
        return
      } catch ( err ) {
        lastError = err instanceof Error ? err.message : String( err )
      }
    }

    updateUpload( task.id, { status: 'failed', error: lastError } )
  }

  const worker = async () => {
    while ( queue.length > 0 ) {
      const task = queue.shift()
      if ( !task ) break
      await runTaskWithRetry( task, DEFAULT_UPLOAD_ATTEMPTS )
      // Do NOT auto-remove; let user clear manually via widget
    }
  }

  const workerCount = Math.min( concurrency, files.length )
  await Promise.all( Array.from( { length: workerCount }, () => worker() ) )
  return completed
}

export async function retryUploadById(
  uploadId: string,
  userId: string,
): Promise<boolean> {
  const upload = uploadStore
    .getState()
    .uploads.find( ( currentUpload ) => currentUpload.id === uploadId )

  if ( !upload?.file ) {
    return false
  }

  updateUpload( uploadId, {
    status: 'uploading',
    error: undefined,
    progress: 0,
  } )

  try {
    await uploadBatch(
      [{ id: uploadId, file: upload.file }],
      userId,
      upload.targetFolderId ?? null,
      1,
    )
    return true
  } catch {
    return false
  }
}
