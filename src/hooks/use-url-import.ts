'use client'

import React, {
  useMemo,
  useOptimistic,
  useTransition,
  type Dispatch,
  type SetStateAction,
} from 'react'
import { useMutation } from '@tanstack/react-query'
import { formatFileSize } from '@/lib/file-utils'
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
  userId: string | null
  currentFolderId: string | null
  onImportComplete?: () => Promise<void> | void
  setItems?: Dispatch<SetStateAction<StorageItem[]>>
}

export function useUrlImport({
  userId,
  currentFolderId,
  onImportComplete,
  setItems,
}: UseUrlImportProps) {
  const [url, setUrl] = React.useState('')
  const [fileName, setFileName] = React.useState('')
  const [importState, setImportState] = React.useState<ImportState>('idle')
  const [error, setError] = React.useState<string | null>(null)
  const [pendingImport, setPendingImport] =
    React.useState<PendingImport | null>(null)
  const [isPending, startTransition] = useTransition()

  // Optimistic items list for instant UI feedback on import
  const currentItems = useMemo(() => (setItems ? [] : []), [setItems])
  const [, addOptimisticItem] = useOptimistic<
    StorageItem[],
    StorageItem
  >(currentItems, (current, newItem) => [...current, newItem])

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

  // Import mutation with optimistic update
  const importMutation = useMutation({
    mutationFn: async (pending: PendingImport) => {
      const { importFileFromUrl } =
        await import('@/lib/storage/mutations/urls-import')
      return importFileFromUrl({
        data: {
          url: pending.url,
          fileName: pending.fileName,
          parentFolderId: currentFolderId,
        },
      })
    },
    onMutate: (pending) => {
      if (setItems && userId) {
        // Optimistic: add a placeholder item immediately
        const optimisticItem: StorageItem = {
          id: `optimistic-${crypto.randomUUID()}`,
          name: pending.fileName,
          objectKey: '',
          mimeType: pending.mimeType ?? null,
          sizeInBytes: 0,
          userId,
          folderId: currentFolderId,
          createdAt: new Date(),
          updatedAt: new Date(),
          type: 'file' as const,
        }
        startTransition(() => {
          addOptimisticItem(optimisticItem)
          setItems((prev) => [...prev, optimisticItem])
        })
      }
    },
    onSuccess: (result) => {
      if (setItems && userId) {
        // Replace optimistic item with real one
        startTransition(() => {
          setItems((prev) => {
            const withoutOptimistic = prev.filter(
              (i) => !i.id.startsWith('optimistic-'),
            )
            return [
              ...withoutOptimistic,
              {
                id: result.file.id,
                name: result.file.name,
                objectKey: result.file.objectKey,
                mimeType: result.file.mimeType,
                sizeInBytes: result.file.sizeInBytes,
                userId,
                folderId: currentFolderId,
                createdAt: result.file.createdAt,
                updatedAt: result.file.createdAt,
                type: 'file' as const,
              },
            ]
          })
        })
      }
    },
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
      await onImportComplete?.()
      reset()
      return true
    } catch (err) {
      startTransition(() => {
        setError(err instanceof Error ? err.message : 'Import failed')
        setImportState('idle')
      })
      return false
    }
  }, [pendingImport, validateUrl, importMutation, onImportComplete, reset])

  const isProcessing = useMemo(
    () => isPending || importState === 'validating' || importState === 'importing',
    [isPending, importState],
  )

  return {
    url,
    setUrl,
    fileName,
    setFileName,
    importState,
    error,
    pendingImport,
    validateUrl,
    executeImport,
    reset,
    isProcessing,
  }
}
