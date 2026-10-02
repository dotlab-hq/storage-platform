'use client'

import React, { useMemo, useTransition } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { formatFileSize } from '@/lib/file-utils'
import {
  addFolderItem,
  refreshFolder,
  removeFolderItems,
  updateFolderItems,
} from '@/lib/storage/folder-query'
import type { StorageItem } from '@/types/storage'

export type ImportState =
  | 'idle'
  | 'validating'
  | 'importing'
  | 'success'
  | 'error'

export interface PendingImport {
  url: string
  fileName: string
  size?: string
  mimeType?: string
}

interface UseUrlImportProps {
  /** Folder the file is imported into (null = My Files root). */
  folderId: string | null
}

export function useUrlImport({ folderId }: UseUrlImportProps) {
  const queryClient = useQueryClient()
  const [url, setUrl] = React.useState('')
  const [fileName, setFileName] = React.useState('')
  const [importState, setImportState] = React.useState<ImportState>('idle')
  const [error, setError] = React.useState<string | null>(null)
  const [pendingImport, setPendingImport] =
    React.useState<PendingImport | null>(null)
  const [isPending, startTransition] = useTransition()

  const reset = React.useCallback(() => {
    startTransition(() => {
      setUrl('')
      setFileName('')
      setImportState('idle')
      setError(null)
      setPendingImport(null)
    })
  }, [])

  // Validation mutation
  const validateMutation = useMutation({
    mutationFn: async (targetUrl: string) => {
      const response = await fetch(targetUrl, { method: 'HEAD' })
      if (!response.ok) {
        throw new Error(
          `Unable to access URL: ${response.status} ${response.statusText}`,
        )
      }

      const contentLength = response.headers.get('content-length')
      if (!contentLength) {
        throw new Error('Unable to determine file size from URL')
      }

      const size = parseInt(contentLength, 10)
      const sizeFormatted = formatFileSize(size)
      const mimeType =
        response.headers.get('content-type') || 'application/octet-stream'

      return { size: sizeFormatted, mimeType }
    },
  })

  const validateUrl = React.useCallback(async () => {
    if (!url.trim()) {
      setError('Please enter a URL')
      return false
    }

    try {
      new URL(url)
    } catch {
      setError('Please enter a valid URL')
      return false
    }

    startTransition(() => {
      setImportState('validating')
      setError(null)
    })

    try {
      const result = await validateMutation.mutateAsync(url)

      let resolvedFileName = fileName.trim()
      if (!resolvedFileName) {
        const urlObj = new URL(url)
        const pathName = urlObj.pathname
        const decodedPath = decodeURIComponent(pathName)
        resolvedFileName = decodedPath.split('/').pop() || 'download'
        resolvedFileName = resolvedFileName.split('?')[0]
      }

      startTransition(() => {
        setPendingImport({
          url,
          fileName: resolvedFileName,
          size: result.size,
          mimeType: result.mimeType,
        })
        setImportState('idle')
      })
      return true
    } catch (err) {
      startTransition(() => {
        setError(err instanceof Error ? err.message : 'Failed to validate URL')
        setImportState('idle')
      })
      return false
    }
  }, [url, fileName, validateMutation])

  // Import mutation: shows a placeholder card immediately, swaps it for the
  // real file on success and removes it again on failure.
  const importMutation = useMutation({
    mutationFn: async (pending: PendingImport) => {
      const { importFileFromUrl } =
        await import('@/lib/storage/mutations/urls-import')
      return importFileFromUrl({
        data: {
          url: pending.url,
          fileName: pending.fileName,
          parentFolderId: folderId,
        },
      })
    },
    onMutate: (pending) => {
      const placeholder: StorageItem = {
        id: `optimistic-${crypto.randomUUID()}`,
        name: pending.fileName,
        objectKey: '',
        mimeType: pending.mimeType ?? null,
        sizeInBytes: 0,
        userId: '',
        folderId,
        createdAt: new Date(),
        updatedAt: new Date(),
        type: 'file',
      }
      addFolderItem(queryClient, folderId, placeholder)
      return { placeholderId: placeholder.id }
    },
    onSuccess: (result, _pending, context) => {
      const file: StorageItem = {
        id: result.file.id,
        name: result.file.name,
        objectKey: result.file.objectKey,
        mimeType: result.file.mimeType,
        sizeInBytes: result.file.sizeInBytes,
        userId: '',
        folderId,
        createdAt: new Date(result.file.createdAt),
        updatedAt: new Date(result.file.createdAt),
        type: 'file',
      }
      updateFolderItems(queryClient, folderId, (items) =>
        items.map((item) => (item.id === context.placeholderId ? file : item)),
      )
    },
    onError: (_error, _pending, context) => {
      if (context) {
        removeFolderItems(queryClient, folderId, [context.placeholderId])
      }
    },
    onSettled: () => refreshFolder(queryClient, folderId),
  })

  const executeImport = React.useCallback(async () => {
    if (!pendingImport) {
      const isValid = await validateUrl()
      return isValid
    }

    startTransition(() => {
      setImportState('importing')
      setError(null)
    })

    try {
      await importMutation.mutateAsync(pendingImport)
      reset()
      return true
    } catch (err) {
      startTransition(() => {
        setError(err instanceof Error ? err.message : 'Import failed')
        setImportState('idle')
      })
      return false
    }
  }, [pendingImport, validateUrl, importMutation, reset])

  const isProcessing = useMemo(
    () =>
      isPending || importState === 'validating' || importState === 'importing',
    [isPending, importState],
  )

  return {
    url,
    setUrl,
    fileName,
    setFileName,
    importState,
    error,
    setError,
    pendingImport,
    setPendingImport,
    validateUrl,
    executeImport,
    reset,
    isProcessing,
  }
}
