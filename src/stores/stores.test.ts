import { beforeEach, describe, expect, it } from 'vitest'
import { useSelectionStore } from './selection-store'
import {
  addUploads,
  clearCompletedUploads,
  removeUploadWithChildren,
  updateUpload,
  useUploadStore,
} from './upload-store'
import type { UploadingFile } from '@/types/storage'

const ids = ['a', 'b', 'c', 'd', 'e']
const selected = () => [...useSelectionStore.getState().selectedIds].sort()

describe('selection store', () => {
  beforeEach(() => useSelectionStore.getState().clear())

  it('plain select replaces the selection', () => {
    const { select } = useSelectionStore.getState()
    select('a')
    select('c')
    expect(selected()).toEqual(['c'])
  })

  it('range select extends from the last selected item', () => {
    const { select } = useSelectionStore.getState()
    select('b')
    select('d', { range: true, orderedIds: ids })
    expect(selected()).toEqual(['b', 'c', 'd'])
  })

  it('toggle adds and removes', () => {
    const { toggle } = useSelectionStore.getState()
    toggle('a')
    toggle('b')
    toggle('a')
    expect(selected()).toEqual(['b'])
  })

  it('retain drops ids that are no longer listed', () => {
    useSelectionStore.getState().selectAll(ids)
    useSelectionStore.getState().retain(['a', 'e'])
    expect(selected()).toEqual(['a', 'e'])
  })
})

describe('upload store', () => {
  const entry = (id: string, extra: Partial<UploadingFile> = {}): UploadingFile => ({
    id,
    progress: 0,
    status: 'uploading',
    ...extra,
  })

  beforeEach(() => useUploadStore.setState({ uploads: [] }))

  it('updates and clears completed uploads', () => {
    addUploads([entry('1'), entry('2')])
    updateUpload('1', { status: 'completed', progress: 100 })
    clearCompletedUploads()
    expect(useUploadStore.getState().uploads.map((u) => u.id)).toEqual(['2'])
  })

  it('removes a folder upload together with its children', () => {
    addUploads([entry('root'), entry('child', { parentUploadId: 'root' }), entry('other')])
    removeUploadWithChildren('root')
    expect(useUploadStore.getState().uploads.map((u) => u.id)).toEqual(['other'])
  })
})
