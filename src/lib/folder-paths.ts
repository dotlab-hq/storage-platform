export type FolderNode = {
  id: string
  name: string
  parentFolderId: string | null
}

export type FolderPathOption = FolderNode & {
  path: string
  depth: number
}

export function buildFolderPathOptions(folders: FolderNode[]) {
  const byId = new Map<string, FolderNode>()
  folders.forEach((folder) => byId.set(folder.id, folder))

  const pathCache = new Map<string, FolderPathOption>()

  function resolve(folderId: string, visiting: Set<string>) {
    const cached = pathCache.get(folderId)
    if (cached) return cached

    const node = byId.get(folderId)
    if (!node) {
      const fallback: FolderPathOption = {
        id: folderId,
        name: 'Unknown',
        parentFolderId: null,
        path: '/Unknown',
        depth: 0,
      }
      pathCache.set(folderId, fallback)
      return fallback
    }

    if (visiting.has(folderId)) {
      const looped: FolderPathOption = {
        ...node,
        path: `/${node.name}`,
        depth: 0,
      }
      pathCache.set(folderId, looped)
      return looped
    }

    visiting.add(folderId)

    if (!node.parentFolderId) {
      const rootChild: FolderPathOption = {
        ...node,
        path: `/${node.name}`,
        depth: 1,
      }
      pathCache.set(folderId, rootChild)
      visiting.delete(folderId)
      return rootChild
    }

    const parent = resolve(node.parentFolderId, visiting)
    const resolved: FolderPathOption = {
      ...node,
      path: `${parent.path}/${node.name}`,
      depth: parent.depth + 1,
    }

    pathCache.set(folderId, resolved)
    visiting.delete(folderId)
    return resolved
  }

  folders.forEach((folder) => {
    resolve(folder.id, new Set<string>())
  })

  return Array.from(pathCache.values()).sort((left, right) =>
    left.path.localeCompare(right.path),
  )
}

export function isDescendantFolder(
  ancestorFolderId: string,
  maybeDescendantId: string,
  folders: Array<Pick<FolderNode, 'id' | 'parentFolderId'>>,
) {
  const parentMap = new Map<string, string | null>()
  folders.forEach((folder) => parentMap.set(folder.id, folder.parentFolderId))

  let cursor: string | null = maybeDescendantId
  let hops = 0

  while (cursor && hops < folders.length + 2) {
    if (cursor === ancestorFolderId) return true
    cursor = parentMap.get(cursor) ?? null
    hops += 1
  }

  return false
}
