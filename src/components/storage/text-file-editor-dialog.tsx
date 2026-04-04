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
  onOpenChange: ( open: boolean ) => void
  currentFolderId: string | null
  item: StorageItem | null
  items: StorageItem[]
  userId: string | null
  onSaved: ( file: StorageItem ) => void
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

function looksLikeHtml( value: string ) {
  return /<\/?[a-z][\s\S]*>/i.test( value.trim() )
}

function getDefaultUntitledName( items: StorageItem[] ) {
  const existing = new Set(
    items.filter( ( item ) => item.type === 'file' ).map( ( item ) => item.name ),
  )

  if ( !existing.has( 'Untitled.txt' ) ) {
    return 'Untitled.txt'
  }

  let index = 1
  while ( existing.has( `Untitled (${index}).txt` ) ) {
    index += 1
  }

  return `Untitled (${index}).txt`
}

export function TextFileEditorDialog( {
  open,
  onOpenChange,
  currentFolderId,
  item,
  items,
  userId,
  onSaved,
}: TextFileEditorDialogProps ) {
  const quillRef = React.useRef<QuillInstance | null>( null )
  const [editorElement, setEditorElement] =
    React.useState<HTMLDivElement | null>( null )
  const [fileName, setFileName] = React.useState( 'Untitled.txt' )
  const [isEditorReady, setIsEditorReady] = React.useState( false )
  const [isLoading, setIsLoading] = React.useState( false )
  const [isSaving, setIsSaving] = React.useState( false )
  const [initError, setInitError] = React.useState<string | null>( null )
  const [mediaKind, setMediaKind] = React.useState<'image' | 'video'>( 'image' )

  const editorRef = React.useCallback( ( node: HTMLDivElement | null ) => {
    setEditorElement( node )
  }, [] )

  const mediaInputRef = React.useRef<HTMLInputElement | null>( null )

  React.useEffect( () => {
    let cancelled = false

    async function mountEditor() {
      if ( !open ) {
        quillRef.current = null
        setIsEditorReady( false )
        return
      }

      setInitError( null )

      if ( !editorElement || quillRef.current ) {
        if ( quillRef.current ) {
          setIsEditorReady( true )
        }
        return
      }

      try {
        const quillModule = await import( 'quill' )
        const highlightModule = await import( 'highlight.js' )
        const katexModule = await import( 'katex' )
        const Quill = quillModule.default
        const hljs = highlightModule.default
        const katex = katexModule.default

          ; ( window as EditorWindow ).hljs = hljs
          ; ( window as EditorWindow ).katex = katex

        if ( cancelled || !editorElement ) {
          return
        }

        editorElement.innerHTML = ''
        quillRef.current = new Quill( editorElement, {
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
        } )

        const toolbar = quillRef.current.getModule( 'toolbar' ) as {
          addHandler?: ( name: string, handler: () => void ) => void
        } | null
        toolbar?.addHandler?.( 'image', () => {
          setMediaKind( 'image' )
          mediaInputRef.current?.click()
        } )
        toolbar?.addHandler?.( 'video', () => {
          setMediaKind( 'video' )
          mediaInputRef.current?.click()
        } )

        setIsEditorReady( true )
      } catch ( error ) {
        const message =
          error instanceof Error ? error.message : 'Failed to initialize editor'
        setInitError( message )
        setIsEditorReady( false )
        toast.error( message )
      }
    }

    void mountEditor()

    return () => {
      cancelled = true
    }
  }, [editorElement, open] )

  React.useEffect( () => {
    if ( !open ) {
      setIsLoading( false )
      setIsSaving( false )
      setInitError( null )
      return
    }

    if ( item?.type === 'file' ) {
      setFileName( item.name )
    } else {
      setFileName( getDefaultUntitledName( items ) )
    }
  }, [item, items, open] )

  React.useEffect( () => {
    if ( !open || !isEditorReady || !quillRef.current ) {
      return
    }

    const quill = quillRef.current
    setIsLoading( true )

    if ( item?.type !== 'file' ) {
      quill.setText( '' )
      setIsLoading( false )
      return
    }

    void ( async () => {
      try {
        const params = new URLSearchParams( { fileId: item.id } )
        const response = await fetch( `/api/storage/text-file?${params}` )
        const data = ( await response.json() )
        if ( !response.ok ) {
          throw new Error( data.error ?? `HTTP ${response.status}` )
        }

        quill.setText( '' )
        if ( looksLikeHtml( data.content ) ) {
          quill.clipboard.dangerouslyPasteHTML( data.content )
        } else {
          quill.setText( data.content )
        }
      } catch ( error ) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to load file',
        )
        onOpenChange( false )
      } finally {
        setIsLoading( false )
      }
    } )()
  }, [isEditorReady, item, onOpenChange, open] )

  const handleSave = React.useCallback( async () => {
    if ( !quillRef.current || !userId ) {
      toast.error( 'Session not ready' )
      return
    }

    setIsSaving( true )
    try {
      const quill = quillRef.current
      const content =
        quill.root.innerHTML === '<p><br></p>' ? '' : quill.root.innerHTML
      const response = await fetch( '/api/storage/save-text-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( {
          fileId: item?.type === 'file' ? item.id : null,
          fileName,
          content,
          parentFolderId:
            item?.type === 'file' ? item.folderId : currentFolderId,
        } ),
      } )
      const data = ( await response.json() )
      if ( !response.ok || !data.file ) {
        throw new Error( data.error ?? `HTTP ${response.status}` )
      }

      onSaved( {
        id: data.file.id,
        name: data.file.name,
        objectKey: data.file.objectKey,
        mimeType: data.file.mimeType,
        sizeInBytes: data.file.sizeInBytes,
        userId,
        folderId: data.file.folderId,
        createdAt: new Date( data.file.createdAt ),
        updatedAt: new Date(),
        type: 'file',
      } )
      toast.success( item?.type === 'file' ? 'File updated' : 'File created' )
      onOpenChange( false )
    } catch ( error ) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to save file',
      )
    } finally {
      setIsSaving( false )
    }
  }, [currentFolderId, fileName, item, onOpenChange, onSaved, userId] )

  const handleMediaInputChange = React.useCallback(
    async ( event: React.ChangeEvent<HTMLInputElement> ) => {
      const file = event.target.files?.[0]
      event.target.value = ''

      if ( !file || !quillRef.current || !userId ) {
        return
      }

      const expectedKind = mediaKind
      if ( !file.type.startsWith( `${expectedKind}/` ) ) {
        toast.error( `Select a ${expectedKind} file` )
        return
      }

      try {
        const uploaded = await uploadFileToS3(
          file,
          userId,
          currentFolderId,
          () => undefined,
        )

        const mediaUrl = buildFileRedirectUrl( {
          folderId: currentFolderId,
          fileId: uploaded.id,
        } )

        onSaved( {
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
        } )

        const quill = quillRef.current
        const selection = quill.getSelection( true )
        const index = selection?.index ?? quill.getLength()
        quill.insertEmbed( index, expectedKind, mediaUrl, 'user' )
        quill.setSelection( index + 1, 0, 'user' )
      } catch ( error ) {
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
        className="max-w-6xl border-stone-200 bg-[#fffdf8] p-0 shadow-2xl sm:h-[88vh]"
        showCloseButton={false}
      >
        <div className="flex h-full min-h-0 flex-col bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.98),_rgba(251,248,241,0.94))]">
          <DialogHeader className="border-b border-stone-200/80 px-7 py-5">
            <div className="flex items-start gap-4">
              <div className="min-w-0 flex-1 space-y-3">
                <DialogTitle className="sr-only">
                  {item?.type === 'file' ? 'Edit File' : 'Create New File'}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  {initError ?? 'Rich text editor for storage documents'}
                </DialogDescription>
                <Input
                  value={fileName}
                  onChange={( event ) => setFileName( event.target.value )}
                  placeholder="Untitled document..."
                  className="h-auto border-0 bg-transparent px-0 py-0 text-4xl font-semibold tracking-tight text-stone-300 shadow-none ring-0 placeholder:text-stone-300 focus-visible:border-0 focus-visible:ring-0 md:text-5xl"
                />
                {initError ? (
                  <p className="text-sm text-red-600">{initError}</p>
                ) : (
                  <p className="text-sm text-stone-500">
                    A rich document editor for text files in your storage.
                  </p>
                )}
              </div>
              <Button
                size="lg"
                onClick={() => void handleSave()}
                disabled={
                  isLoading || isSaving || !isEditorReady || !!initError
                }
                className="rounded-full bg-sky-500 px-6 text-white shadow-sm hover:bg-sky-500/90"
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
          <div className="relative min-h-0 flex-1 overflow-hidden px-7 py-6">
            {( isLoading || ( !isEditorReady && !initError ) ) && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#fffdf8]/80 backdrop-blur-sm">
                <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
              </div>
            )}
            <div
              className={cn(
                'h-full min-h-[480px] overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_1px_0_rgba(28,25,23,0.02)]',
                '[&_.ql-container]:h-[calc(100%-58px)] [&_.ql-container]:border-0 [&_.ql-editor]:min-h-[420px] [&_.ql-editor]:px-5 [&_.ql-editor]:py-7 [&_.ql-editor]:font-serif [&_.ql-editor]:text-[28px] [&_.ql-editor]:leading-[1.7] [&_.ql-editor]:text-stone-700 [&_.ql-editor.ql-blank::before]:left-5 [&_.ql-editor.ql-blank::before]:right-5 [&_.ql-editor.ql-blank::before]:font-serif [&_.ql-editor.ql-blank::before]:text-[20px] [&_.ql-editor.ql-blank::before]:italic [&_.ql-editor.ql-blank::before]:text-stone-300',
                '[&_.ql-toolbar]:rounded-none [&_.ql-toolbar]:border-x-0 [&_.ql-toolbar]:border-t-0 [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-stone-200 [&_.ql-toolbar]:bg-[#fffdfa] [&_.ql-toolbar]:px-3 [&_.ql-toolbar]:py-2',
                '[&_.ql-toolbar_.ql-picker]:text-stone-500 [&_.ql-toolbar_button]:text-stone-500 [&_.ql-toolbar_button:hover]:text-stone-800 [&_.ql-toolbar_button.ql-active]:text-stone-900 [&_.ql-toolbar_.ql-stroke]:stroke-current [&_.ql-toolbar_.ql-fill]:fill-current',
                '[&_.ql-toolbar_.ql-picker-label:hover]:text-stone-800 [&_.ql-toolbar_.ql-picker-label.ql-active]:text-stone-900 [&_.ql-toolbar_.ql-picker-options]:border-stone-200 [&_.ql-toolbar_.ql-picker-options]:bg-white',
                '[&_.ql-editor_h1]:text-5xl [&_.ql-editor_h1]:font-semibold [&_.ql-editor_h2]:text-4xl [&_.ql-editor_h2]:font-semibold [&_.ql-editor_h3]:text-3xl [&_.ql-editor_h3]:font-semibold',
                '[&_.ql-editor_img]:max-h-[420px] [&_.ql-editor_img]:rounded-xl [&_.ql-editor_video]:min-h-[280px] [&_.ql-editor_video]:w-full [&_.ql-editor_video]:rounded-xl',
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
