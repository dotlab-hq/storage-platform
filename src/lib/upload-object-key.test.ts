import { describe, expect, test } from 'vitest'
import { buildUploadObjectKey } from './upload-object-key'

describe('buildUploadObjectKey', () => {
  test('places the unique id after the base name and before the extension', () => {
    const key = buildUploadObjectKey({
      segments: ['user-1'],
      fileName: 'Quarterly Report.pdf',
      uniqueId: 'uuid-1',
    })

    expect(key).toBe('user-1/Quarterly_Report-uuid-1.pdf')
  })

  test('supports nested upload prefixes', () => {
    const key = buildUploadObjectKey({
      segments: ['user-1', 'session-1'],
      fileName: 'folder photo.png',
      uniqueId: 'uuid-2',
    })

    expect(key).toBe('user-1/session-1/folder_photo-uuid-2.png')
  })
})
