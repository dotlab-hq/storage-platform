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
import { uploadFileToS3 } from '@/lib/upload-utils'
import { toast } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'
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
  items: StorageItem[]
  userId: string | null
  onSaved: (file: StorageItem) => void
}

type QuillModule = typeof import('quill')
type QuillInstance = InstanceType<QuillModule['default']>

type EditorWindow = Window & {
  hljs?: unknown
  katex?: unknown
}

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

function getDefaultUntitledName(items: StorageItem[]) {
  const existing = new Set(
    items.filter((item) => item.type === 'file').map((item) => item.name),
  )

  if (!existing.has('Untitled.txt')) {
    return 'Untitled.txt'
  }

  let index = 1
  while (existing.has(`Untitled (${index}).txt`)) {
    index += 1
  }

  return `Untitled (${index}).txt`
}

export function TextFileEditorDialog({
  open,
  onOpenChange,
  currentFolderId,
  item,
  items,
  userId,
  onSaved,
}: TextFileEditorDialogProps) {
  const quillRef = React.useRef<QuillInstance | null>(null)
  const [editorElement, setEditorElement] =
    React.useState<HTMLDivElement | null>(null)
  const [fileName, setFileName] = React.useState('Untitled.txt')
  const [isEditorReady, setIsEditorReady] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [initError, setInitError] = React.useState<string | null>(null)
  const [mediaKind, setMediaKind] = React.useState<'image' | 'video'>('image')

  const editorRef = React.useCallback((node: HTMLDivElement | null) => {
    setEditorElement(node)
  }, [])

  const mediaInputRef = React.useRef<HTMLInputElement | null>(null)

  React.useEffect(() => {
    let cancelled = false

    async function mountEditor() {
      if (!open) {
        quillRef.current = null
        setIsEditorReady(false)
        return
      }

      setInitError(null)

      if (!open || !editorElement || quillRef.current) {
        if (quillRef.current) {
          setIsEditorReady(true)
        }
        return
      }

      try {
        const quillModule = await import('quill')
        const highlightModule = await import('highlight.js')
        const katexModule = await import('katex')
        const Quill = quillModule.default
        const hljs = highlightModule.default ?? highlightModule
        const katex = katexModule.default ?? katexModule

        ;(window as EditorWindow).hljs = hljs
        ;(window as EditorWindow).katex = katex

        if (cancelled || !editorElement) {
          return
        }

        editorElement.innerHTML = ''
        quillRef.current = new Quill(editorElement, {
          theme: 'snow',
          placeholder: 'Start writing...',
          modules: {
            toolbar: TOOLBAR_OPTIONS,
            syntax: { hljs },
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

        const toolbar = quillRef.current.getModule('toolbar') as {
          addHandler?: (name: string, handler: () => void) => void
        } | null
        toolbar?.addHandler?.('image', () => {
          setMediaKind('image')
          mediaInputRef.current?.click()
        })
        toolbar?.addHandler?.('video', () => {
          setMediaKind('video')
          mediaInputRef.current?.click()
        })

        setIsEditorReady(true)
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to initialize editor'
        setInitError(message)
        setIsEditorReady(false)
        toast.error(message)
      }
    }

    void mountEditor()

    return () => {
      cancelled = true
    }
  }, [editorElement, open])

  React.useEffect(() => {
    if (!open) {
      setIsLoading(false)
      setIsSaving(false)
      setInitError(null)
      return
    }

    if (item?.type === 'file') {
      setFileName(item.name)
    } else {
      setFileName(getDefaultUntitledName(items))
    }
  }, [item, items, open])

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
      const content =
        quill.root.innerHTML === '<p><br></p>' ? '' : quill.root.innerHTML
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

  const handleMediaInputChange = React.useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      event.target.value = ''

      if (!file || !quillRef.current || !userId) {
        return
      }

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

        const params = new URLSearchParams({ userId, fileId: uploaded.id })
        const response = await fetch(`/api/storage/presign?${params}`)
        const data = (await response.json()) as { url?: string; error?: string }
        if (!response.ok || !data.url) {
          throw new Error(data.error ?? `HTTP ${response.status}`)
        }

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
        const index = selection?.index ?? quill.getLength()
        quill.insertEmbed(index, expectedKind, data.url, 'user')
        quill.setSelection(index + 1, 0, 'user')
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : `Failed to upload ${expectedKind}`,
        )
      }
    },
    [currentFolderId, mediaKind, onSaved, userId],
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-6xl p-0 sm:h-[88vh]"
        showCloseButton={false}
      >
        <div className="flex h-full min-h-0 flex-col">
          <DialogHeader className="border-b px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <DialogTitle>
                  {item?.type === 'file' ? 'Edit File' : 'Create New File'}
                </DialogTitle>
                <DialogDescription>
                  Quill is used for text-based file editing in the root storage
                  view.
                  {initError ? ` ${initError}` : ''}
                </DialogDescription>
              </div>
              <Button
                onClick={() => void handleSave()}
                disabled={
                  isLoading || isSaving || !isEditorReady || !!initError
                }
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
            {(isLoading || (!isEditorReady && !initError)) && (
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
            <input
              ref={mediaInputRef}
              type="file"
              className="hidden"
              accept={mediaKind === 'image' ? 'image/*' : 'video/*'}
              onChange={handleMediaInputChange}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
