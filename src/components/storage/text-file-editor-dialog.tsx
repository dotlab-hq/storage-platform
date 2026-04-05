'use client'

import * as React from 'react'
import { Loader2, Save, X, FileText } from 'lucide-react'
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
        const data:EditorFileResponse = (await response.json())
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
      const data:SaveFileResponse = (await response.json())
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
                <p className="text-xs text-muted-foreground">
                  {item?.type === 'file' ? 'Editing file' : 'Creating new file'}
                </p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              onClick={() => void handleSave()}
              disabled={isLoading || isSaving || !isEditorReady || !!initError}
              className="gap-1.5"
            >
              {isSaving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Save
            </Button>
          </div>
        </div>

        <DialogHeader className="sr-only">
          <DialogTitle>
            {item?.type === 'file' ? 'Edit File' : 'Create New File'}
          </DialogTitle>
          <DialogDescription>
            {initError ?? 'Rich text editor for storage documents'}
          </DialogDescription>
        </DialogHeader>

        <div className="relative flex-1 overflow-hidden">
          {(isLoading || (!isEditorReady && !initError)) && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70">
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          )}
          <div
            className={cn(
              'h-full overflow-y-auto',
              '[&_.ql-container]:border-0 [&_.ql-container]:bg-transparent',
              '[&_.ql-editor]:min-h-full [&_.ql-editor]:px-4 [&_.ql-editor]:py-4 [&_.ql-editor]:font-serif [&_.ql-editor]:text-base [&_.ql-editor]:leading-relaxed [&_.ql-editor]:text-foreground',
              '[&_.ql-editor.ql-blank::before]:left-4 [&_.ql-editor.ql-blank::before]:right-4 [&_.ql-editor.ql-blank::before]:font-serif [&_.ql-editor.ql-blank::before]:text-sm [&_.ql-editor.ql-blank::before]:italic [&_.ql-editor.ql-blank::before]:text-muted-foreground',
              '[&_.ql-toolbar]:sticky [&_.ql-toolbar]:top-0 [&_.ql-toolbar]:z-10 [&_.ql-toolbar]:border-0 [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-border [&_.ql-toolbar]:bg-muted/50 [&_.ql-toolbar]:px-2 [&_.ql-toolbar]:py-2 [&_.ql-toolbar]:backdrop-blur-sm',
              '[&_.ql-toolbar_.ql-picker]:text-muted-foreground [&_.ql-toolbar_button]:text-muted-foreground [&_.ql-toolbar_button:hover]:text-foreground [&_.ql-toolbar_button.ql-active]:text-foreground',
              '[&_.ql-toolbar_.ql-picker-label:hover]:text-foreground [&_.ql-toolbar_.ql-picker-label.ql-active]:text-foreground [&_.ql-toolbar_.ql-picker-options]:border-border [&_.ql-toolbar_.ql-picker-options]:bg-popover',
              '[&_.ql-editor_h1]:text-3xl [&_.ql-editor_h1]:font-semibold [&_.ql-editor_h2]:text-2xl [&_.ql-editor_h2]:font-semibold [&_.ql-editor_h3]:text-xl [&_.ql-editor_h3]:font-semibold',
              '[&_.ql-editor_img]:max-h-[300px] [&_.ql-editor_img]:rounded-lg [&_.ql-editor_video]:min-h-[200px] [&_.ql-editor_video]:w-full [&_.ql-editor_video]:rounded-lg',
            )}
          >
            <div ref={editorRef} />
          </div>
          <input
            ref={mediaInputRef}
            type="file"
            className="hidden"
            accept={mediaKind === 'image' ? 'image/*' : 'video/*'}
            onChange={handleMediaInputChange}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
