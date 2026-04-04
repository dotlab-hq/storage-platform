'use client'

import * as React from 'react'
import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'
import { getFileIcon } from '@/lib/file-utils'
import { getFileExtension, isTextBasedFile } from '@/lib/file-type-utils'
import type { StorageItem } from '@/types/storage'
import 'quill/dist/quill.snow.css'
import 'katex/dist/katex.min.css'

type EditorFileResponse = {
  id: string
  name: string
  mimeType: string | null
  content: string
  error?: string
}

type SaveFileResponse = {
  file?: {
    id: string
    name: string
    objectKey: string
    mimeType: string | null
    sizeInBytes: number
    createdAt: string
    folderId: string | null
  }
  error?: string
}

type TextFileEditorDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentFolderId: string | null
  item: StorageItem | null
  userId: string | null
  onSaved: (file: StorageItem) => void
}

type QuillModule = typeof import('quill')
type QuillInstance = InstanceType<QuillModule['default']>

const TOOLBAR_OPTIONS = [
  [{ font: [] }, { size: [] }],
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ color: [] }, { background: [] }],
  [{ script: 'sub' }, { script: 'super' }],
  [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
  [{ indent: '-1' }, { indent: '+1' }],
  [{ direction: 'rtl' }, { align: [] }],
  ['blockquote', 'code-block'],
  ['link', 'image', 'video', 'formula'],
  ['clean'],
]

function looksLikeHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value.trim())
}

function shouldPersistAsHtml(fileName: string) {
  const extension = getFileExtension(fileName)
  return extension === 'html' || extension === 'htm'
}

export function TextFileEditorDialog({
  open,
  onOpenChange,
  currentFolderId,
  item,
  userId,
  onSaved,
}: TextFileEditorDialogProps) {
  const editorRef = React.useRef<HTMLDivElement | null>(null)
  const quillRef = React.useRef<QuillInstance | null>(null)
  const [fileName, setFileName] = React.useState('Untitled.html')
  const [isEditorReady, setIsEditorReady] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false

    async function mountEditor() {
      if (!open || !editorRef.current || quillRef.current) {
        return
      }

      const quillModule = await import('quill')
      const highlight = await import('highlight.js')
      const katexModule = await import('katex')
      const Quill = quillModule.default

      ;(window as Window & { hljs?: unknown; katex?: unknown }).hljs =
        highlight.default
      ;(window as Window & { hljs?: unknown; katex?: unknown }).katex =
        katexModule.default

      if (cancelled || !editorRef.current) {
        return
      }

      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
        placeholder: 'Start writing...',
        modules: {
          toolbar: TOOLBAR_OPTIONS,
          syntax: true,
          history: {
            delay: 500,
            maxStack: 200,
            userOnly: true,
          },
        },
        formats: [
          'font',
          'size',
          'header',
          'bold',
          'italic',
          'underline',
          'strike',
          'color',
          'background',
          'script',
          'list',
          'bullet',
          'indent',
          'direction',
          'align',
          'blockquote',
          'code-block',
          'link',
          'image',
          'video',
          'formula',
        ],
      })

      setIsEditorReady(true)
    }

    void mountEditor()

    return () => {
      cancelled = true
    }
  }, [open])

  React.useEffect(() => {
    if (!open) {
      setIsLoading(false)
      setIsSaving(false)
      return
    }

    if (item?.type === 'file') {
      setFileName(item.name)
    } else {
      setFileName('Untitled.html')
    }
  }, [item, open])

  React.useEffect(() => {
    if (!open || !isEditorReady || !quillRef.current) {
      return
    }

    const quill = quillRef.current
    setIsLoading(true)

    if (item?.type !== 'file') {
      quill.setText('')
      setIsLoading(false)
      return
    }

    void (async () => {
      try {
        const params = new URLSearchParams({ fileId: item.id })
        const response = await fetch(`/api/storage/text-file?${params}`)
        const data = (await response.json()) as EditorFileResponse
        if (!response.ok) {
          throw new Error(data.error ?? `HTTP ${response.status}`)
        }

        quill.setText('')
        if (looksLikeHtml(data.content)) {
          quill.clipboard.dangerouslyPasteHTML(data.content)
        } else {
          quill.setText(data.content)
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to load file',
        )
        onOpenChange(false)
      } finally {
        setIsLoading(false)
      }
    })()
  }, [isEditorReady, item, onOpenChange, open])

  const handleSave = React.useCallback(async () => {
    if (!quillRef.current || !userId) {
      toast.error('Session not ready')
      return
    }

    setIsSaving(true)
    try {
      const quill = quillRef.current
      const html =
        quill.root.innerHTML === '<p><br></p>' ? '' : quill.root.innerHTML
      const content = shouldPersistAsHtml(fileName)
        ? html
        : quill.getText().replace(/\n$/, '')
      const response = await fetch('/api/storage/save-text-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: item?.type === 'file' ? item.id : null,
          fileName,
          content,
          parentFolderId:
            item?.type === 'file' ? item.folderId : currentFolderId,
        }),
      })
      const data = (await response.json()) as SaveFileResponse
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
      toast.error(
        error instanceof Error ? error.message : 'Failed to save file',
      )
    } finally {
      setIsSaving(false)
    }
  }, [currentFolderId, fileName, item, onOpenChange, onSaved, userId])

  const Icon = isTextBasedFile(fileName, null)
    ? getFileIcon(fileName, null)
    : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-6xl p-0 sm:h-[88vh]"
        showCloseButton={false}
      >
        <div className="flex h-full min-h-0 flex-col">
          <DialogHeader className="border-b px-6 py-4">
            <div className="flex items-center gap-3">
              {Icon ? (
                <div className="bg-muted text-muted-foreground flex h-10 w-10 items-center justify-center rounded-lg">
                  <Icon className="h-5 w-5" />
                </div>
              ) : null}
              <div className="min-w-0 flex-1">
                <DialogTitle>
                  {item?.type === 'file' ? 'Edit File' : 'Create New File'}
                </DialogTitle>
                <DialogDescription>
                  Quill is used for text-based file editing in the root storage
                  view.
                </DialogDescription>
              </div>
              <Button
                onClick={() => void handleSave()}
                disabled={isLoading || isSaving || !isEditorReady}
              >
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save
              </Button>
            </div>
            <Input
              value={fileName}
              onChange={(event) => setFileName(event.target.value)}
              placeholder="File name"
              className="mt-4"
            />
          </DialogHeader>
          <div className="relative min-h-0 flex-1 overflow-hidden px-6 py-4">
            {(isLoading || !isEditorReady) && (
              <div className="bg-background/80 absolute inset-0 z-10 flex items-center justify-center">
                <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
              </div>
            )}
            <div
              className={cn(
                'h-full min-h-[480px] overflow-hidden rounded-lg border',
                '[&_.ql-container]:h-[calc(100%-42px)] [&_.ql-editor]:min-h-[420px] [&_.ql-editor]:text-sm',
              )}
            >
              <div ref={editorRef} className="h-full" />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
