import { useCallback, useOptimistic, useState, useTransition } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/ui/sonner'
import { buildFileRedirectUrl, buildNavUrl } from '@/lib/nav-token'
import { downloadFromUrl } from '@/lib/file-utils'
import { setFolderPrivateLockClient } from '@/lib/private-lock-client'
import { generateFileSummaryForItem } from '@/lib/file-summary/client'
import { createFolderFn } from '@/lib/storage-actions-server'
import { renameItemFn } from '@/lib/storage/mutations/rename'
import { getFilePresignedUrlFn } from '@/lib/storage/mutations/urls'
import { STORAGE_QUERY_KEYS } from '@/lib/query-keys'
import type { StorageItem, ContextMenuAction } from '@/types/storage'
import type { UseStorageActionsParams } from '@/hooks/storage-actions.types'

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
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

  const queryClient = useQueryClient()
  const [renamingItemId, setRenamingItemId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  // Optimistic state for items during rename
  const [optimisticItems, addOptimisticRename] = useOptimistic<
    StorageItem[],
    { itemId: string; newName: string }
  >([], (currentItems, { itemId, newName }) =>
    currentItems.map((item) =>
      item.id === itemId ? { ...item, name: newName } : item,
    ),
  )

  // Rename mutation with optimistic update
  const renameMutation = useMutation({
    mutationFn: async ({
      item,
      newName,
    }: {
      item: StorageItem
      newName: string
    }) => {
      await renameItemFn({
        data: { itemId: item.id, newName, itemType: item.type },
      })
    },
    onMutate: ({ item, newName }) => {
      // Optimistic rename
      setItems((previous) =>
        previous.map((i) => (i.id === item.id ? { ...i, name: newName } : i)),
      )
      startTransition(() => {
        addOptimisticRename({ itemId: item.id, newName })
      })
    },
    onError: (error, { item }) => {
      // Rollback on failure
      setItems((previous) =>
        previous.map((i) => (i.id === item.id ? { ...i, name: item.name } : i)),
      )
      toast.error(`Rename failed: ${getErrorMessage(error, 'Unknown error')}`)
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: STORAGE_QUERY_KEYS.folderItems(currentFolderId),
      })
    },
  })

  // Create folder mutation with optimistic update
  const createFolderMutation = useMutation({
    mutationFn: async (name: string) => {
      const { folder: created } = await createFolderFn({
        data: { name, parentFolderId: currentFolderId ?? undefined },
      })
      return created
    },
    onSuccess: (created) => {
      if (!userId) return
      const newFolder: StorageItem = {
        id: created.id,
        name: created.name,
        type: 'folder',
        userId,
        parentFolderId: currentFolderId,
        createdAt: new Date(created.createdAt),
        updatedAt: new Date(created.createdAt),
      }
      startTransition(() => {
        setItems((previous) => [newFolder, ...previous])
      })
    },
    onError: (error) => {
      toast.error(
        `Folder creation failed: ${getErrorMessage(error, 'Unknown error')}`,
      )
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: STORAGE_QUERY_KEYS.folderItems(currentFolderId),
      })
    },
  })

  const handleDoubleClick = useCallback(
    async (item: StorageItem) => {
      if (item.type === 'folder') {
        startTransition(() => {
          setCurrentFolderId(item.id)
        })
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
      setRenamingItemId(null)
      renameMutation.mutate({ item, newName })
    },
    [userId, renameMutation],
  )

  const handleNewFolder = useCallback(
    async (name: string) => {
      if (!userId) {
        toast.error('Session not ready')
        return
      }
      createFolderMutation.mutate(name)
    },
    [userId, createFolderMutation],
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
