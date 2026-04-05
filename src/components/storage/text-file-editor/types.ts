import type { StorageItem } from '@/types/storage'
import type Quill from 'quill'

export type EditorFileResponse = {
  id: string
  name: string
  mimeType: string | null
  content: string
  error?: string
}

export type SaveFileResponse = {
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

export type TextFileEditorDialogProps = {
  open: boolean
  onOpenChange: ( open: boolean ) => void
  currentFolderId: string | null
  item: StorageItem | null
  items: StorageItem[]
  userId: string | null
  onSaved: ( file: StorageItem ) => void
}

export type QuillModule = typeof Quill
export type QuillInstance = InstanceType<QuillModule>

export type EditorWindow = Window & {
  hljs?: unknown
  katex?: unknown
}
