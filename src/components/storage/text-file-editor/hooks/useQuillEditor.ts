'use client'

import * as React from 'react'
import { toast } from '@/components/ui/sonner'
import {
  looksLikeHtml,
  TOOLBAR_OPTIONS,
  getDefaultUntitledName,
} from '../utils'
import type { EditorWindow, QuillInstance } from '../types'
import type { StorageItem } from '@/types/storage'

import { getTextFileContentFn } from '@/lib/storage/mutations/content'

export function useQuillEditor(options: {
  open: boolean
  item: StorageItem | null
  items: StorageItem[]
  onOpenChange: (open: boolean) => void
}) {
  const { open, item, items, onOpenChange } = options

  const quillRef = React.useRef<QuillInstance | null>(null)
  const [editorElement, setEditorElement] =
    React.useState<HTMLDivElement | null>(null)
  const [fileName, setFileName] = React.useState('Untitled.txt')
  const [isEditorReady, setIsEditorReady] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [initError, setInitError] = React.useState<string | null>(null)
  const [mediaKind, setMediaKind] = React.useState<'image' | 'video'>('image')
  const mediaInputRef = React.useRef<HTMLInputElement | null>(null)

  const editorRef = React.useCallback((node: HTMLDivElement | null) => {
    setEditorElement(node)
  }, [])

  // Mount editor
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

        if (cancelled) return

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

        const toolbar = quillRef.current.getModule('toolbar') as any
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

  // Setup filename
  React.useEffect(() => {
    if (!open) {
      setIsLoading(false)
      setInitError(null)
      return
    }

    if (item?.type === 'file') {
      setFileName(item.name)
    } else {
      setFileName(getDefaultUntitledName(items))
    }
  }, [item, items, open])

  // Load content
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
        const data = await getTextFileContentFn({ data: { fileId: item.id } })

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

  return {
    quillRef,
    editorRef,
    fileName,
    setFileName,
    isEditorReady,
    isLoading,
    setIsLoading,
    initError,
    mediaKind,
    mediaInputRef,
  }
}
