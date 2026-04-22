type SharedFolderTree = {
  folders: {
    id: string
    name: string
    parentFolderId: string | null
    depth: number
  }[]
  files: {
    id: string
    name: string
    sizeInBytes: number
    folderId: string | null
  }[]
}

type ShareFolderTreeProps = {
  tree: SharedFolderTree
  formatBytes: (bytes: number) => string
}

const DEPTH_PADDING_CLASSES = [
  'pl-0',
  'pl-3',
  'pl-6',
  'pl-9',
  'pl-12',
  'pl-16',
  'pl-20',
  'pl-24',
] as const

function depthPaddingClass(depth: number): string {
  const bounded = Math.max(0, Math.min(depth, DEPTH_PADDING_CLASSES.length - 1))
  return DEPTH_PADDING_CLASSES[bounded]
}

export function ShareFolderTree({ tree, formatBytes }: ShareFolderTreeProps) {
  const folderDepthMap = new Map<string, number>()
  tree.folders.forEach((folder) => {
    folderDepthMap.set(folder.id, folder.depth)
  })

  return (
    <div className="bg-card text-left rounded-md border p-3 w-full max-w-xl space-y-1">
      {tree.folders.map((folder) => (
        <div
          key={folder.id}
          className={`text-sm ${depthPaddingClass(folder.depth)}`}
        >
          📁 {folder.name}
        </div>
      ))}
      {tree.files.map((file) => (
        <div
          key={file.id}
          className={`text-muted-foreground text-xs ${depthPaddingClass((folderDepthMap.get(file.folderId ?? '') ?? 0) + 1)}`}
        >
          📄 {file.name} ({formatBytes(file.sizeInBytes)})
        </div>
      ))}
    </div>
  )
}
