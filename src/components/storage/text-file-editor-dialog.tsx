'use client'

import * as React from 'react'
import { Eye, Loader2, Pencil, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { buildFileRedirectUrl } from '@/lib/nav-token'
import { uploadFileToS3 } from '@/lib/upload-utils'
import { toast } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'
import type { StorageItem } from '@/types/storage'
import type Quill from 'quill'
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

type QuillModule = typeof Quill
type QuillInstance = InstanceType<QuillModule>

type EditorWindow = Window & {
  hljs?: unknown
  katex?: unknown
}

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ color: [] }, { background: [] }],
  ['blockquote', 'code-block'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ align: [] }],
  ['link', 'image', 'video'],
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
  const [editorMode, setEditorMode] = React.useState<'write' | 'read'>('write')
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

      if (!editorElement || quillRef.current) {
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
        const hljs = highlightModule.default
        const katex = katexModule.default

        ;(window as EditorWindow).hljs = hljs
        ;(window as EditorWindow).katex = katex

        if (cancelled || !editorElement) {
          return
        }

        editorElement.innerHTML = ''
        quillRef.current = new Quill(editorElement, {
          theme: 'snow',
          placeholder: 'Start writing something beautiful...',
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
            'header',
            'bold',
            'italic',
            'underline',
            'strike',
            'color',
            'background',
            'list',
            'bullet',
            'align',
            'blockquote',
            'code-block',
            'link',
            'image',
            'video',
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
      setEditorMode('write')
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
    if (!quillRef.current || !open) {
      return
    }

    quillRef.current.enable(editorMode === 'write')
  }, [editorMode, open])

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
        const index = selection?.index ?? quill.getLength()
        quill.insertEmbed(index, expectedKind, mediaUrl, 'user')
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
        className="w-[min(96vw,72rem)] max-w-none overflow-hidden border-border bg-background p-0 shadow-2xl sm:h-[88vh]"
        showCloseButton={false}
      >
        <div className="flex h-full min-h-0 flex-col bg-gradient-to-b from-muted/30 to-background">
          <DialogHeader className="border-b border-border/70 px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex flex-wrap items-start gap-3 sm:gap-4">
              <div className="min-w-0 flex-1 space-y-3">
                <DialogTitle className="sr-only">
                  {item?.type === 'file' ? 'Edit File' : 'Create New File'}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  {initError ?? 'Rich text editor for storage documents'}
                </DialogDescription>
                <Input
                  value={fileName}
                  readOnly={editorMode === 'read'}
                  onChange={(event) => setFileName(event.target.value)}
                  placeholder="Untitled document..."
                  className="h-auto border-0 bg-transparent px-0 py-0 text-2xl font-semibold tracking-tight text-foreground shadow-none ring-0 placeholder:text-muted-foreground focus-visible:border-0 focus-visible:ring-0 md:text-4xl"
                />
                {initError ? (
                  <p className="text-sm text-red-600">{initError}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    A rich document editor for text files in your storage.
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setEditorMode((prev) => (prev === 'write' ? 'read' : 'write'))
                }
                className="rounded-full"
              >
                {editorMode === 'write' ? (
                  <>
                    <Pencil className="mr-2 h-4 w-4" />
                    Write mode
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Read mode
                  </>
                )}
              </Button>
              <Button
                size="lg"
                onClick={() => void handleSave()}
                disabled={
                  editorMode === 'read' ||
                  isLoading ||
                  isSaving ||
                  !isEditorReady ||
                  !!initError
                }
                className="rounded-full px-6"
              >
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save
              </Button>
            </div>
          </DialogHeader>
          <div className="relative min-h-0 flex-1 overflow-hidden px-4 py-4 sm:px-6 sm:py-5">
            {(isLoading || (!isEditorReady && !initError)) && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70 backdrop-blur-sm">
                <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
              </div>
            )}
            <div
              className={cn(
                'h-full min-h-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm',
                '[&_.ql-container]:h-[calc(100%-52px)] [&_.ql-container]:border-0 [&_.ql-container]:bg-transparent [&_.ql-editor]:min-h-full [&_.ql-editor]:overflow-y-auto [&_.ql-editor]:px-4 [&_.ql-editor]:py-5 [&_.ql-editor]:font-serif [&_.ql-editor]:text-lg [&_.ql-editor]:leading-8 [&_.ql-editor]:text-foreground sm:[&_.ql-editor]:px-5 sm:[&_.ql-editor]:py-6 sm:[&_.ql-editor]:text-2xl',
                '[&_.ql-editor.ql-blank::before]:left-4 [&_.ql-editor.ql-blank::before]:right-4 [&_.ql-editor.ql-blank::before]:font-serif [&_.ql-editor.ql-blank::before]:text-base [&_.ql-editor.ql-blank::before]:italic [&_.ql-editor.ql-blank::before]:text-muted-foreground sm:[&_.ql-editor.ql-blank::before]:text-lg',
                '[&_.ql-toolbar]:rounded-none [&_.ql-toolbar]:border-x-0 [&_.ql-toolbar]:border-t-0 [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-border [&_.ql-toolbar]:bg-muted/35 [&_.ql-toolbar]:px-2 [&_.ql-toolbar]:py-2',
                '[&_.ql-toolbar_.ql-picker]:text-muted-foreground [&_.ql-toolbar_button]:text-muted-foreground [&_.ql-toolbar_button:hover]:text-foreground [&_.ql-toolbar_button.ql-active]:text-foreground [&_.ql-toolbar_.ql-stroke]:stroke-current [&_.ql-toolbar_.ql-fill]:fill-current',
                '[&_.ql-toolbar_.ql-picker-label:hover]:text-foreground [&_.ql-toolbar_.ql-picker-label.ql-active]:text-foreground [&_.ql-toolbar_.ql-picker-options]:border-border [&_.ql-toolbar_.ql-picker-options]:bg-popover',
                '[&_.ql-editor_h1]:text-4xl [&_.ql-editor_h1]:font-semibold [&_.ql-editor_h2]:text-3xl [&_.ql-editor_h2]:font-semibold [&_.ql-editor_h3]:text-2xl [&_.ql-editor_h3]:font-semibold',
                '[&_.ql-editor_img]:max-h-[420px] [&_.ql-editor_img]:rounded-xl [&_.ql-editor_video]:min-h-[280px] [&_.ql-editor_video]:w-full [&_.ql-editor_video]:rounded-xl',
                editorMode === 'read' &&
                  '[&_.ql-toolbar]:hidden [&_.ql-container]:h-full [&_.ql-editor]:cursor-default',
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
