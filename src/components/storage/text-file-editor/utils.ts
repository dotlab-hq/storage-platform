import type { StorageItem } from '@/types/storage'

export const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ color: [] }, { background: [] }],
  ['blockquote', 'code-block'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ align: [] }],
  ['link', 'image', 'video'],
  ['clean'],
]

export function looksLikeHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value.trim())
}

export function getDefaultUntitledName(items: StorageItem[]) {
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
