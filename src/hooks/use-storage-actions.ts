import { useCallback, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/ui/sonner'
import { buildFileRedirectUrl, buildNavUrl } from '@/lib/nav-token'
import { downloadFromUrl } from '@/lib/file-utils'
import { setFolderPrivateLockClient } from '@/lib/private-lock-client'
import { generateFileSummaryForItem } from '@/lib/file-summary/client'
import { createFolderFn } from '@/lib/storage-actions-server'
import { renameItemFn } from '@/lib/storage/mutations/rename'
import { getFilePresignedUrlFn } from '@/lib/storage/mutations/urls'
import {
  addFolderItem,
  folderItemsQuery,
  refreshFolder,
  updateFolderItems,
} from '@/lib/storage/folder-query'
import { useOpenFolder } from '@/hooks/use-folder-navigation'
import { useSelectionStore } from '@/stores/selection-store'
import { useUiStore } from '@/stores/ui-store'
import type { ContextMenuAction, StorageItem } from '@/types/storage'

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown error'
}

async function openFileInNewTab(file: StorageItem) {
  // Open the tab synchronously (inside the click) so popup blockers allow it,
  // then point it at the presigned URL once we have it.
  const tab = window.open('', '_blank')
  try {
    const { url } = await getFilePresignedUrlFn({ data: { fileId: file.id } })
    if (tab) tab.location.href = url
    else window.open(url, '_blank')
  } catch (error) {
    tab?.close()
    toast.error(`Failed to open file: ${errorMessage(error)}`)
  }
}

/**
 * Single-item actions for the file browser: open, rename, new folder and the
 * context-menu commands. Bulk delete/move live in `use-bulk-actions.ts`.
 */
export function useStorageActions(folderId: string | null) {
  const queryClient = useQueryClient()
  const openFolder = useOpenFolder()
  const [renamingItemId, setRenamingItemId] = useState<string | null>(null)

  const renameMutation = useMutation({
    mutationFn: ({ item, newName }: { item: StorageItem; newName: string }) =>
      renameItemFn({ data: { itemId: item.id, newName, itemType: item.type } }),
    onMutate: async ({ item, newName }) => {
      await queryClient.cancelQueries({
        queryKey: folderItemsQuery(folderId).queryKey,
      })
      updateFolderItems(queryClient, folderId, (items) =>
        items.map((i) => (i.id === item.id ? { ...i, name: newName } : i)),
      )
    },
    onError: (error, { item }) => {
      updateFolderItems(queryClient, folderId, (items) =>
        items.map((i) => (i.id === item.id ? { ...i, name: item.name } : i)),
      )
      toast.error(`Rename failed: ${errorMessage(error)}`)
    },
    onSettled: () => refreshFolder(queryClient, folderId),
  })

  const createFolderMutation = useMutation({
    mutationFn: async (name: string) => {
      const { folder } = await createFolderFn({
        data: { name, parentFolderId: folderId ?? undefined },
      })
      return folder
    },
    onSuccess: (folder) => {
      addFolderItem(queryClient, folderId, {
        id: folder.id,
        name: folder.name,
        type: 'folder',
        userId: '',
        parentFolderId: folderId,
        createdAt: new Date(folder.createdAt),
        updatedAt: new Date(folder.createdAt),
      })
    },
    onError: (error) =>
      toast.error(`Folder creation failed: ${errorMessage(error)}`),
    onSettled: () => refreshFolder(queryClient, folderId),
  })

  const open = useCallback(
    (item: StorageItem) => {
      if (item.type === 'folder') openFolder(item.id)
      else void openFileInNewTab(item)
    },
    [openFolder],
  )

  const rename = useCallback(
    (item: StorageItem, newName: string) => {
      setRenamingItemId(null)
      const trimmed = newName.trim()
      if (!trimmed || trimmed === item.name) return
      renameMutation.mutate({ item, newName: trimmed })
    },
    [renameMutation],
  )

  const createFolder = useCallback(
    (name: string) => createFolderMutation.mutateAsync(name).then(() => {}),
    [createFolderMutation],
  )

  const handleContextAction = useCallback(
    async (action: ContextMenuAction, item: StorageItem) => {
      const selection = useSelectionStore.getState()
      const ui = useUiStore.getState()

      switch (action) {
        case 'open':
          open(item)
          return
        case 'rename':
          setRenamingItemId(item.id)
          return
        case 'select':
          selection.select(item.id)
          return
        case 'move':
        case 'update-path':
          // Act on the whole selection if the item is part of it.
          if (!selection.selectedIds.has(item.id)) selection.select(item.id)
          ui.openMove(action)
          return
        case 'share':
          ui.openShare(item)
          return
        case 'delete': {
          ui.confirmDelete([item])
          return
        }
        case 'private-lock':
          if (item.type !== 'folder') return
          try {
            await setFolderPrivateLockClient(item.id, !item.isPrivatelyLocked)
            await refreshFolder(queryClient, folderId)
          } catch (error) {
            toast.error(`Private lock update failed: ${errorMessage(error)}`)
          }
          return
        case 'copy-link': {
          const url =
            item.type === 'folder'
              ? buildNavUrl({ folderId: item.id })
              : buildFileRedirectUrl({ folderId, fileId: item.id })
          try {
            await navigator.clipboard.writeText(url)
            toast.success('Link copied')
          } catch {
            toast.error('Could not copy the link')
          }
          return
        }
        case 'download':
          if (item.type !== 'file') return
          try {
            const { url } = await getFilePresignedUrlFn({
              data: { fileId: item.id },
            })
            await downloadFromUrl(url, item.name)
          } catch (error) {
            toast.error(`Download failed: ${errorMessage(error)}`)
          }
          return
        case 'generate-summary':
          if (item.type !== 'file') return
          try {
            const summary = await generateFileSummaryForItem(item.id)
            await navigator.clipboard.writeText(summary)
            toast.success('Summary copied to clipboard')
          } catch (error) {
            toast.error(`Summary failed: ${errorMessage(error)}`)
          }
          return
      }
    },
    [folderId, open, queryClient],
  )

  return {
    open,
    rename,
    createFolder,
    handleContextAction,
    renamingItemId,
    setRenamingItemId,
  }
}
