import {
  completeS3ViewerMultipartUploadFn,
  createS3ViewerUploadPresignUrlFn,
} from '@/lib/storage/mutations/s3-viewer/presigned-multipart'

const MIN_PART_SIZE_BYTES = 5 * 1024 * 1024
const TARGET_PART_COUNT = 8
const MAX_PART_COUNT = 10_000
const PART_CONCURRENCY = 4

type UploadedPart = {
  partNumber: number
  eTag: string
}

function computePartSize( fileSize: number ): number {
  const byTargetCount = Math.ceil( fileSize / TARGET_PART_COUNT )
  const byPartLimit = Math.ceil( fileSize / MAX_PART_COUNT )
  return Math.max( MIN_PART_SIZE_BYTES, byTargetCount, byPartLimit )
}

function uploadChunkWithProgress(
  presignedUrl: string,
  chunk: Blob,
  contentType: string,
  onProgress: ( loadedBytes: number ) => void,
): Promise<string> {
  return new Promise( ( resolve, reject ) => {
    const xhr = new XMLHttpRequest()

    xhr.upload.onprogress = ( event ) => {
      if ( event.lengthComputable ) {
        onProgress( event.loaded )
      }
    }

    xhr.onload = () => {
      if ( xhr.status < 200 || xhr.status >= 300 ) {
        reject( new Error( `Upload part failed: HTTP ${xhr.status}` ) )
        return
      }
      onProgress( chunk.size )
      const rawETag = xhr.getResponseHeader( 'ETag' )
      if ( !rawETag ) {
        reject( new Error( 'Upload part missing ETag header' ) )
        return
      }
      resolve( rawETag )
    }

    xhr.onerror = () => reject( new Error( 'Network error during upload' ) )
    xhr.open( 'PUT', presignedUrl )
    xhr.setRequestHeader( 'Content-Type', contentType )
    xhr.send( chunk )
  } )
}

export async function uploadFileWithMultipartPresignedUrl( input: {
  bucketName: string
  objectKey: string
  file: File
  onProgress: ( progress: number ) => void
} ): Promise<void> {
  const contentType = input.file.type || 'application/octet-stream'
  const totalSize = Math.max( 1, input.file.size )
  const partSize = computePartSize( input.file.size )
  const partCount = Math.max( 1, Math.ceil( input.file.size / partSize ) )

  const initialized = await createS3ViewerUploadPresignUrlFn( {
    data: {
      bucketName: input.bucketName,
      objectKey: input.objectKey,
      contentType,
      expiresInSeconds: 900,
      partCount,
    },
  } )

  if ( initialized.partUrls.length !== partCount ) {
    throw new Error( 'Multipart session did not return expected part URLs' )
  }

  const loadedByPart = new Array<number>( partCount ).fill( 0 )
  const uploadedParts: UploadedPart[] = []
  let totalLoaded = 0
  let nextIndex = 0

  const uploadWorker = async () => {
    while ( nextIndex < partCount ) {
      const index = nextIndex
      nextIndex += 1
      const partNumber = index + 1
      const start = index * partSize
      const end = Math.min( start + partSize, input.file.size )
      const chunk = input.file.slice( start, end )
      const partUrl = initialized.partUrls[index]
      if ( !partUrl ) {
        throw new Error( `Missing presigned URL for part ${partNumber}` )
      }

      const eTag = await uploadChunkWithProgress(
        partUrl.presignedUrl,
        chunk,
        contentType,
        ( loaded ) => {
          totalLoaded += loaded - loadedByPart[index]
          loadedByPart[index] = loaded
          const percent = Math.floor( ( totalLoaded / totalSize ) * 100 )
          input.onProgress( Math.min( 99, Math.max( 0, percent ) ) )
        },
      )

      uploadedParts.push( { partNumber, eTag } )
    }
  }

  const workerCount = Math.min( PART_CONCURRENCY, partCount )
  await Promise.all( Array.from( { length: workerCount }, () => uploadWorker() ) )

  await completeS3ViewerMultipartUploadFn( {
    data: {
      bucketName: input.bucketName,
      objectKey: input.objectKey,
      uploadId: initialized.uploadId,
      parts: uploadedParts,
    },
  } )

  input.onProgress( 100 )
}
