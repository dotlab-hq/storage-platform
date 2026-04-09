import { useCallback, useState } from 'react'
import { toast } from '@/components/ui/sonner'
import { buildFileRedirectUrl, buildNavUrl } from '@/lib/nav-token'
import { downloadFromUrl } from '@/lib/file-utils'
import { setFolderPrivateLockClient } from '@/lib/private-lock-client'
import type { StorageItem, ContextMenuAction } from '@/types/storage'

import { createFolderFn } from '@/lib/storage-actions-server'
import { renameItemFn } from '@/lib/storage/mutations/rename'
import { getFilePresignedUrlFn } from '@/lib/storage/mutations/urls'

type UseStorageActionsParams = {
  userId: string | null
  currentFolderId: string | null
  setItems: React.Dispatch<React.SetStateAction<StorageItem[]>>
  refresh: () => Promise<void>
  setCurrentFolderId: (id: string | null) => void
  select: (id: string, shift: boolean) => void
  clearSelection: () => void
  selectedIds: Set<string>
  onDeleteOpen: (item: StorageItem) => void
  onMoveOpen: (mode?: 'move' | 'update-path') => void
  onShareOpen: (item: StorageItem) => void
}

export function useStorageActions(params: UseStorageActionsParams) {
  const {
    userId,
    currentFolderId,
    setItems,
    setCurrentFolderId,
    select,
    onDeleteOpen,
    onMoveOpen,
    onShareOpen,
  } = params

  const [renamingItemId, setRenamingItemId] = useState<string | null>(null)

  const handleDoubleClick = useCallback(
    async (item: StorageItem) => {
      if (item.type === 'folder') {
        setCurrentFolderId(item.id)
        return
      }
      if (!userId) return
      try {
        const { url } = await getFilePresignedUrlFn({
          data: { fileId: item.id },
        })
        window.open(url, '_blank')
      } catch (err) {
        toast.error(
          `Failed to open file: ${err instanceof Error ? err.message : 'Unknown error'}`,
        )
      }
    },
    [setCurrentFolderId, userId],
  )

  const handleRename = useCallback(
    async (item: StorageItem, newName: string) => {
      if (!userId) return
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, name: newName } : i)),
      )
      setRenamingItemId(null)
      try {
        await renameItemFn({
          data: { itemId: item.id, newName, itemType: item.type },
        })
        toast.success(`Renamed to "${newName}"`)
      } catch (err) {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, name: item.name } : i)),
        )
        toast.error(
          `Rename failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
        )
      }
    },
    [userId, setItems],
  )

  const handleContextAction = useCallback(
    (action: ContextMenuAction, item: StorageItem) => {
      switch (action) {
        case 'open':
          void handleDoubleClick(item)
          break
        case 'rename':
          setRenamingItemId(item.id)
          break
        case 'select':
          select(item.id, false)
          break
        case 'move':
          select(item.id, false)
          onMoveOpen('move')
          break
        case 'update-path':
          select(item.id, false)
          onMoveOpen('update-path')
          break
        case 'share':
          onShareOpen(item)
          break
        case 'private-lock':
          if (!userId || item.type !== 'folder') return
          void setFolderPrivateLockClient(item.id, !item.isPrivatelyLocked)
            .then(() => {
              toast.success(
                !item.isPrivatelyLocked
                  ? 'Private lock enabled'
                  : 'Private lock removed',
              )
              void params.refresh()
            })
            .catch((err: Error) => {
              toast.error(`Private lock update failed: ${err.message}`)
            })
          break
        case 'copy-link': {
          const payload =
            item.type === 'folder'
              ? { folderId: item.id }
              : { folderId: currentFolderId, fileId: item.id }
          const url =
            item.type === 'folder'
              ? buildNavUrl(payload)
              : buildFileRedirectUrl(payload)
          void navigator.clipboard.writeText(url)
          toast.success('Link copied to clipboard')
          break
        }
        case 'delete':
          onDeleteOpen(item)
          break
        case 'download':
          if (!userId || item.type !== 'file') return
          void getFilePresignedUrlFn({ data: { fileId: item.id } })
            .then(({ url }) => downloadFromUrl(url, item.name))
            .catch(() => toast.error('Download failed'))
          break
      }
    },
    [
      currentFolderId,
      handleDoubleClick,
      onDeleteOpen,
      onMoveOpen,
      onShareOpen,
      params,
      select,
      userId,
    ],
  )

  const handleNewFolder = useCallback(
    async (name: string) => {
      if (!userId) {
        toast.error('Session not ready')
        return
      }
      try {
        const { folder: created } = await createFolderFn({
          data: { name, parentFolderId: currentFolderId ?? undefined },
        })
        const newFolder: StorageItem = {
          id: created.id,
          name: created.name,
          type: 'folder',
          userId,
          parentFolderId: currentFolderId,
          createdAt: new Date(created.createdAt),
          updatedAt: new Date(created.createdAt),
        }
        setItems((prev) => [newFolder, ...prev])
        toast.success(`Folder "${created.name}" created`)
      } catch (err) {
        toast.error(
          `Folder creation failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
        )
      }
    },
    [userId, currentFolderId, setItems],
  )

  return {
    handleDoubleClick,
    handleContextAction,
    handleNewFolder,
    handleRename,
    renamingItemId,
    setRenamingItemId,
  }
}
