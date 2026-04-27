export type S3ViewerFileEntry = {
  key: string
  name: string
  sizeInBytes: number
  eTag: string | null
  lastModified: string | null
}

export type S3ViewerFolderEntry = {
  name: string
  prefix: string
}

export type UploadingFile = {
  id: string
  name: string
  sizeInBytes: number
  progress: number
  status: 'uploading' | 'completed' | 'error'
  errorMessage?: string
}
