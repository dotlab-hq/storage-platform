import { describe, expect, it, vi } from 'vitest'
import { QueryClient } from '@tanstack/react-query'
import type { StorageItem } from '@/types/storage'

// The query module imports server functions; they're irrelevant here.
vi.mock('@/lib/storage/queries/server', () => ({ getFolderItemsFn: vi.fn() }))
vi.mock('@/lib/server-functions/quota', () => ({ getUserQuotaSnapshotFn: vi.fn() }))

const {
  addFolderItem,
  flattenFolderPages,
  folderItemsQuery,
  removeFolderItems,
  updateFolderItems,
} = await import('./folder-query')

const file = (id: string, name = id): StorageItem => ({
  id,
  name,
  type: 'file',
  userId: 'u',
  folderId: null,
  objectKey: '',
  mimeType: null,
  sizeInBytes: 1,
  createdAt: new Date(0),
  updatedAt: new Date(0),
})

function seed(pages: StorageItem[][]) {
  const queryClient = new QueryClient()
  queryClient.setQueryData(folderItemsQuery(null).queryKey, {
    pages: pages.map((items, index) => ({ items, breadcrumbs: [], page: index + 1 })),
    pageParams: pages.map((_, index) => index + 1),
  })
  const read = () =>
    flattenFolderPages(queryClient.getQueryData(folderItemsQuery(null).queryKey)!)
      .items.map((item) => item.name)
  return { queryClient, read }
}

describe('folder cache helpers', () => {
  it('adds new items to the top once', () => {
    const { queryClient, read } = seed([[file('a')], [file('b')]])
    addFolderItem(queryClient, null, file('n'))
    addFolderItem(queryClient, null, file('n'))
    expect(read()).toEqual(['n', 'a', 'b'])
  })

  it('removes items from every page', () => {
    const { queryClient, read } = seed([[file('a'), file('b')], [file('c')]])
    removeFolderItems(queryClient, null, ['b', 'c'])
    expect(read()).toEqual(['a'])
  })

  it('renames items on later pages without duplicating additions', () => {
    const { queryClient, read } = seed([[file('a')], [file('b')]])
    updateFolderItems(queryClient, null, (items) => [
      file('extra'),
      ...items.map((item) => (item.id === 'b' ? { ...item, name: 'B' } : item)),
    ])
    expect(read()).toEqual(['extra', 'a', 'B'])
  })

  it('dedupes items that shifted between pages', () => {
    const { read } = seed([[file('a'), file('b')], [file('b'), file('c')]])
    expect(read()).toEqual(['a', 'b', 'c'])
  })
})
