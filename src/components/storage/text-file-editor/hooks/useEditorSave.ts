'use client'
import * as React from 'react'
import { toast } from '@/components/ui/sonner'
import type { StorageItem } from '@/types/storage'
import type { SaveFileResponse, QuillInstance } from '../types'

export function useEditorSave(options: {
  quillRef: React.MutableRefObject<QuillInstance | null>;
  userId: string | null;
  item: StorageItem | null;
  fileName: string;
  currentFolderId: string | null;
  onSaved: (file: StorageItem) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const { quillRef, userId, item, fileName, currentFolderId, onSaved, onOpenChange } = options
  const [isSaving, setIsSaving] = React.useState(false)

  const handleSave = React.useCallback(async () => {
    if (!quillRef.current || !userId) {
      toast.error('Session not ready')
      return
    }

    setIsSaving(true)
    try {
      const quill = quillRef.current
      const content = quill.root.innerHTML === '<p><br></p>' ? '' : quill.root.innerHTML
      const response = await fetch('/api/storage/save-text-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: item?.type === 'file' ? item.id : null,
          fileName,
          content,
          parentFolderId: item?.type === 'file' ? item.folderId : currentFolderId,
        }),
      })
      const data: SaveFileResponse = await response.json()
      if (!response.ok || !data.file) {
        throw new Error(data.error ?? `HTTP ${response.status}`)
      }

      onSaved({
        id: data.file.id,
        name: data.file.name,
        objectKey: data.file.objectKey,
        mimeType: data.file.mimeType,
        sizeInBytes: data.file.sizeInBytes,
        userId,
        folderId: data.file.folderId,
        createdAt: new Date(data.file.createdAt),
        updatedAt: new Date(),
        type: 'file',
      })
      toast.success(item?.type === 'file' ? 'File updated' : 'File created')
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save file')
    } finally {
      setIsSaving(false)
    }
  }, [currentFolderId, fileName, item, onOpenChange, onSaved, userId, quillRef])

  return { isSaving, handleSave }
}
