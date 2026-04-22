'use client'

import * as React from 'react'
import { Loader2, Save, X, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import { buildFileRedirectUrl } from '@/lib/nav-token'
import { uploadFileToS3 } from '@/lib/upload-utils'
import { toast } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'

import type { TextFileEditorDialogProps } from './types'
import { useQuillEditor } from './hooks/useQuillEditor'
import { useEditorSave } from './hooks/useEditorSave'

import 'quill/dist/quill.snow.css'
import 'katex/dist/katex.min.css'

export function TextFileEditorDialog({
  open,
  onOpenChange,
  currentFolderId,
  item,
  items,
  userId,
  onSaved,
}: TextFileEditorDialogProps) {
  const {
    quillRef,
    editorRef,
    fileName,
    setFileName,
    isEditorReady,
    isLoading,
    initError,
    mediaKind,
    mediaInputRef,
  } = useQuillEditor({ open, item, items, onOpenChange })

  const { isSaving, handleSave } = useEditorSave({
    quillRef,
    userId,
    item,
    fileName,
    currentFolderId,
    onSaved,
    onOpenChange,
  })

  // Media Insertion Handlers
  React.useEffect(() => {
    const handleMediaInputChange = async (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0]
      ;(event.target as HTMLInputElement).value = ''
      if (!file || !quillRef.current || !userId) return

      const expectedKind = mediaKind
      if (!file.type.startsWith(`${expectedKind}/`)) {
        toast.error(`Select a ${expectedKind} file`)
        return
      }

      try {
        const uploaded = await uploadFileToS3(
          file,
          userId,
          currentFolderId,
          () => undefined,
        )
        const mediaUrl = buildFileRedirectUrl({
          folderId: currentFolderId,
          fileId: uploaded.id,
        })

        onSaved({
          id: uploaded.id,
          name: uploaded.name,
          objectKey: uploaded.objectKey,
          mimeType: uploaded.mimeType,
          sizeInBytes: uploaded.sizeInBytes,
          userId,
          folderId: currentFolderId,
          createdAt: uploaded.createdAt,
          updatedAt: uploaded.createdAt,
          type: 'file',
        })

        const quill = quillRef.current
        const selection = quill.getSelection(true)
        const index = selection.index
        quill.insertEmbed(index, expectedKind, mediaUrl, 'user')
        quill.setSelection(index + 1, 0, 'user')
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : `Failed to upload ${expectedKind}`,
        )
      }
    }

    const node = mediaInputRef.current
    node?.addEventListener('change', handleMediaInputChange)
    return () => node?.removeEventListener('change', handleMediaInputChange)
  }, [currentFolderId, mediaKind, onSaved, userId, quillRef, mediaInputRef])

  const handleClose = React.useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="fixed top-[50%] left-[50%] z-50 flex h-[85vh] w-[95vw] max-w-4xl translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden border-border bg-background p-0 shadow-2xl"
        showCloseButton={false}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <Input
                value={fileName}
                onChange={(event) => setFileName(event.target.value)}
                placeholder="Untitled document..."
                className="h-auto border-0 bg-transparent px-0 py-0 text-base font-semibold text-foreground shadow-none ring-0 placeholder:text-muted-foreground focus-visible:border-0 focus-visible:ring-0"
              />
              {initError ? (
                <p className="text-xs text-red-500">{initError}</p>
              ) : (
                <p className="truncate text-xs text-muted-foreground">
                  {item?.type === 'file'
                    ? 'Editing existing file'
                    : 'Creating new file'}
                </p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 pl-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isSaving || isLoading}
            >
              <X className="h-4 w-4" />
              <span className="sr-only md:not-sr-only md:ml-2">Cancel</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={isSaving || isLoading || !isEditorReady || !!initError}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin md:mr-2" />
              ) : (
                <Save className="h-4 w-4 md:mr-2" />
              )}
              <span className="sr-only md:not-sr-only">
                {isSaving ? 'Saving...' : 'Save File'}
              </span>
            </Button>
          </div>
        </div>
        <div className="relative flex-1 bg-muted/20">
          {(isLoading || !isEditorReady) && !initError && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 flex-col gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="w-64 space-y-2">
                <PageSkeleton variant="compact" className="h-4 w-2/3 mx-auto" />
                <PageSkeleton variant="default" className="h-10" />
              </div>
            </div>
          )}
          <div
            ref={editorRef}
            className={cn(
              'h-full bg-background [&_.ql-container]:text-base [&_.ql-editor]:min-h-[calc(85vh-8rem)] [&_.ql-editor]:pb-16 [&_.ql-toolbar]:sticky [&_.ql-toolbar]:top-0 [&_.ql-toolbar]:z-10 [&_.ql-toolbar]:bg-background [&_.ql-toolbar]:border-x-0 [&_.ql-toolbar]:border-t-0',
              !isEditorReady && 'invisible',
            )}
          />
        </div>
      </DialogContent>
      <input
        type="file"
        accept="image/*,video/*"
        ref={mediaInputRef}
        className="hidden"
        aria-label="Select media file"
      />
    </Dialog>
  )
}
