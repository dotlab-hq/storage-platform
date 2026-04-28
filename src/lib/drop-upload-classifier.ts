export type FolderUploadSource =
  | { type: 'entry'; entry: FileSystemDirectoryEntry }
  | {
      type: 'files'
      folderName: string
      files: Array<{ file: File; relativePath: string }>
    }

function getRootAndRelativePath(file: File): {
  rootFolder: string | null
  relativePath: string | null
} {
  const fullPath = file.webkitRelativePath
  if (!fullPath || !fullPath.includes('/')) {
    return { rootFolder: null, relativePath: null }
  }

  const slashIndex = fullPath.indexOf('/')
  const rootFolder = fullPath.slice(0, slashIndex)
  const relativePath = fullPath.slice(slashIndex + 1)

  return {
    rootFolder,
    relativePath: relativePath.length > 0 ? relativePath : file.name,
  }
}

export function classifyDroppedUploads(dataTransfer: DataTransfer): {
  files: File[]
  folders: FolderUploadSource[]
} {
  const foldersFromEntries: FolderUploadSource[] = []
  const plainFiles: File[] = []
  const groupedFolderFiles = new Map<
    string,
    Array<{ file: File; relativePath: string }>
  >()

  for (const item of Array.from(dataTransfer.items)) {
    const entry = item.webkitGetAsEntry?.()
    if (entry?.isDirectory) {
      foldersFromEntries.push({
        type: 'entry',
        entry: entry as FileSystemDirectoryEntry,
      })
    }
  }

  for (const file of Array.from(dataTransfer.files)) {
    const { rootFolder, relativePath } = getRootAndRelativePath(file)
    if (rootFolder && relativePath) {
      const filesInFolder = groupedFolderFiles.get(rootFolder) ?? []
      filesInFolder.push({ file, relativePath })
      groupedFolderFiles.set(rootFolder, filesInFolder)
      continue
    }
    plainFiles.push(file)
  }

  if (foldersFromEntries.length > 0) {
    return { files: plainFiles, folders: foldersFromEntries }
  }

  const foldersFromFiles: FolderUploadSource[] = Array.from(
    groupedFolderFiles.entries(),
  ).map(([folderName, files]) => ({
    type: 'files',
    folderName,
    files,
  }))

  return {
    files: plainFiles,
    folders: foldersFromFiles,
  }
}
