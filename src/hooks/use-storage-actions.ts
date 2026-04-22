import { useCallback, useState } from 'react'
import { toast } from '@/components/ui/sonner'
import { buildFileRedirectUrl, buildNavUrl } from '@/lib/nav-token'
import { downloadFromUrl } from '@/lib/file-utils'
import { setFolderPrivateLockClient } from '@/lib/private-lock-client'
import { generateFileSummaryForItem } from '@/lib/file-summary/client'
import { createFolderFn } from '@/lib/storage-actions-server'
import { renameItemFn } from '@/lib/storage/mutations/rename'
import { getFilePresignedUrlFn } from '@/lib/storage/mutations/urls'
import type { StorageItem, ContextMenuAction } from '@/types/storage'
import type { UseStorageActionsParams } from '@/hooks/storage-actions.types'

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

function withOptimisticRename(
  setItems: React.Dispatch<React.SetStateAction<StorageItem[]>>,
  itemId: string,
  nextName: string,
) {
  setItems((previous) =>
    previous.map((item) =>
      item.id === itemId ? { ...item, name: nextName } : item,
    ),
  )
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
      } catch (error) {
        toast.error(
          `Failed to open file: ${getErrorMessage(error, 'Unknown error')}`,
        )
      }
    },
    [setCurrentFolderId, userId],
  )

  const handleRename = useCallback(
    async (item: StorageItem, newName: string) => {
      if (!userId) return

      withOptimisticRename(setItems, item.id, newName)
      setRenamingItemId(null)
      try {
        await renameItemFn({
          data: { itemId: item.id, newName, itemType: item.type },
        })
      } catch (error) {
        withOptimisticRename(setItems, item.id, item.name)
        toast.error(`Rename failed: ${getErrorMessage(error, 'Unknown error')}`)
      }
    },
    [setItems, userId],
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
        setItems((previous) => [newFolder, ...previous])
      } catch (error) {
        toast.error(
          `Folder creation failed: ${getErrorMessage(error, 'Unknown error')}`,
        )
      }
    },
    [currentFolderId, setItems, userId],
  )

  const handleContextAction = useCallback(
    (action: ContextMenuAction, item: StorageItem) => {
      switch (action) {
        case 'open':
          void handleDoubleClick(item)
          return
        case 'rename':
          setRenamingItemId(item.id)
          return
        case 'select':
          select(item.id, false)
          return
        case 'move':
          select(item.id, false)
          onMoveOpen('move')
          return
        case 'update-path':
          select(item.id, false)
          onMoveOpen('update-path')
          return
        case 'share':
          onShareOpen(item)
          return
        case 'private-lock':
          if (!userId || item.type !== 'folder') return
          void setFolderPrivateLockClient(item.id, !item.isPrivatelyLocked)
            .then(() => params.refresh())
            .catch((error: Error) => {
              toast.error(`Private lock update failed: ${error.message}`)
            })
          return
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
          return
        }
        case 'delete':
          onDeleteOpen(item)
          return
        case 'download':
          if (!userId || item.type !== 'file') return
          void getFilePresignedUrlFn({ data: { fileId: item.id } })
            .then(({ url }) => downloadFromUrl(url, item.name))
            .catch(() => toast.error('Download failed'))
          return
        case 'generate-summary':
          if (!userId || item.type !== 'file') return
          void generateFileSummaryForItem(item.id)
            .then((summary) => navigator.clipboard.writeText(summary))
            .catch((error: Error) =>
              toast.error(`Summary failed: ${error.message}`),
            )
          return
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

  return {
    handleDoubleClick,
    handleContextAction,
    handleNewFolder,
    handleRename,
    renamingItemId,
    setRenamingItemId,
  }
}
