'use client'

import React, { type Dispatch, type SetStateAction } from 'react'
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

  const reset = React.useCallback(() => {
    setUrl('')
    setFileName('')
    setImportState('idle')
    setError(null)
    setPendingImport(null)
  }, [])

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

    setImportState('validating')
    setError(null)

    try {
      const response = await fetch(url, { method: 'HEAD' })
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

      let resolvedFileName = fileName.trim()
      if (!resolvedFileName) {
        const urlObj = new URL(url)
        const pathName = urlObj.pathname
        const decodedPath = decodeURIComponent(pathName)
        resolvedFileName = decodedPath.split('/').pop() || 'download'
        resolvedFileName = resolvedFileName.split('?')[0]
      }

      setPendingImport({
        url,
        fileName: resolvedFileName,
        size: sizeFormatted,
        mimeType,
      })
      setImportState('idle')
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate URL')
      setImportState('idle')
      return false
    }
  }, [url, fileName])

  const executeImport = React.useCallback(async () => {
    if (!pendingImport) {
      const isValid = await validateUrl()
      return isValid
    }

    setImportState('importing')
    setError(null)

    try {
      const { importFileFromUrl } =
        await import('@/lib/storage/mutations/urls-import')
      const result = await importFileFromUrl({
        data: {
          url: pendingImport.url,
          fileName: pendingImport.fileName,
          parentFolderId: currentFolderId,
        },
      })

      if (setItems && userId) {
        setItems((prev) => [
          ...prev,
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
        ])
      }

      await onImportComplete?.()
      reset()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed')
      setImportState('idle')
      return false
    }
  }, [
    pendingImport,
    currentFolderId,
    setItems,
    userId,
    onImportComplete,
    reset,
    validateUrl,
  ])

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
  }
}
