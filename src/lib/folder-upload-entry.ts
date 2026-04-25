import { uploadFolderFromFiles } from './folder-upload-files'
import type { UploadStateUpdater } from './folder-upload-core'
import type { FolderUploadResult } from './folder-upload-core'

async function readAllEntries(
  directory: FileSystemDirectoryEntry,
): Promise<FileSystemEntry[]> {
  const reader = directory.createReader()
  const allEntries: FileSystemEntry[] = []

  while ( true ) {
    const batch = await new Promise<FileSystemEntry[]>( ( resolve, reject ) => {
      reader.readEntries( resolve, reject )
    } )
    if ( batch.length === 0 ) break
    allEntries.push( ...batch )
  }

  return allEntries
}

async function collectFolderFiles(
  directory: FileSystemDirectoryEntry,
  relativePath = '',
): Promise<Array<{ file: File; relativePath: string }>> {
  const entries = await readAllEntries( directory )
  const files: Array<{ file: File; relativePath: string }> = []

  for ( const entry of entries ) {
    if ( entry.isFile ) {
      const fileEntry = entry as FileSystemFileEntry
      const file = await new Promise<File>( ( resolve, reject ) => {
        fileEntry.file( resolve, reject )
      } )
      files.push( {
        file,
        relativePath: relativePath
          ? `${relativePath}/${entry.name}`
          : entry.name,
      } )
      continue
    }

    if ( entry.isDirectory ) {
      const nestedDirectory = entry as FileSystemDirectoryEntry
      const nestedPath = relativePath
        ? `${relativePath}/${nestedDirectory.name}`
        : nestedDirectory.name
      const nestedFiles = await collectFolderFiles( nestedDirectory, nestedPath )
      files.push( ...nestedFiles )
    }
  }

  return files
}

export async function uploadFolder(
  folderEntry: FileSystemDirectoryEntry,
  userId: string,
  parentFolderId: string | null,
  setUploads: UploadStateUpdater,
  options?: {
    fileConcurrency?: number
    maxAttempts?: number
  },
): Promise<FolderUploadResult> {
  const files = await collectFolderFiles( folderEntry )
  if ( files.length === 0 ) {
    return { success: false, error: 'No files found in folder' }
  }

  return uploadFolderFromFiles( {
    folderName: folderEntry.name,
    files,
    userId,
    parentFolderId,
    setUploads,
    options,
  } )
}
