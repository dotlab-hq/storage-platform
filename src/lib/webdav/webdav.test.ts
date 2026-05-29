import { describe, expect, test } from 'vitest'
import { getParentKey, parseWebDavPath } from './path'
import {
  createLock,
  refreshLock,
  unlock,
  hasConflictingLock,
  getLocks,
} from './locks'

describe('WebDAV path utilities', () => {
  test('getParentKey extracts the correct parent folder path', () => {
    expect(getParentKey('file.txt')).toBe('')
    expect(getParentKey('dir1/')).toBe('')
    expect(getParentKey('dir1/file.txt')).toBe('dir1')
    expect(getParentKey('dir1/dir2/')).toBe('dir1')
    expect(getParentKey('dir1/dir2/file.txt')).toBe('dir1/dir2')
  })

  test('parseWebDavPath correctly parses bucket and keys', () => {
    const root = parseWebDavPath('http://localhost/api/storage/webdav')
    expect(root.isRoot).toBe(true)
    expect(root.bucketName).toBeNull()

    const bucket = parseWebDavPath('http://localhost/api/storage/webdav/my-bucket')
    expect(bucket.isRoot).toBe(false)
    expect(bucket.bucketName).toBe('my-bucket')
    expect(bucket.objectKey).toBeNull()

    const file = parseWebDavPath('http://localhost/api/storage/webdav/my-bucket/folder1/file.txt')
    expect(file.isRoot).toBe(false)
    expect(file.bucketName).toBe('my-bucket')
    expect(file.objectKey).toBe('folder1/file.txt')
  })
})

describe('WebDAV locks matching and validation', () => {
  test('infinity depth lock on dir1 does not conflict with dir1-other', () => {
    // 1. Create a lock on my-bucket at dir1/
    const request = new Request('http://localhost/api/storage/webdav/my-bucket/dir1/')
    const lock = createLock({
      request,
      bucketName: 'my-bucket',
      objectKey: 'dir1/',
      owner: 'test-owner',
      depth: 'infinity',
      scope: 'exclusive',
    })

    if (lock === 'conflict') {
      throw new Error('Lock creation failed unexpectedly')
    }

    // 2. Check if a different folder starting with "dir1" has a conflict
    // Request has no lock token headers, so if there is a matching lock, it should be conflicting.
    const conflictRequest = new Request('http://localhost/api/storage/webdav/my-bucket/dir1-other/file.txt')
    const hasConflict = hasConflictingLock(conflictRequest, 'my-bucket', 'dir1-other/file.txt')
    expect(hasConflict).toBe(false)

    // 3. Check that a child of dir1/ DOES have a conflict
    const childRequest = new Request('http://localhost/api/storage/webdav/my-bucket/dir1/file.txt')
    const childConflict = hasConflictingLock(childRequest, 'my-bucket', 'dir1/file.txt')
    expect(childConflict).toBe(true)

    // Clean up
    const unlockRequest = new Request('http://localhost/api/storage/webdav/my-bucket/dir1/', {
      headers: { 'lock-token': `<${lock.token}>` },
    })
    const unlocked = unlock(unlockRequest, 'my-bucket', 'dir1/')
    expect(unlocked).toBe(true)
  })

  test('refreshLock and unlock validate target path and token ownership', () => {
    const request = new Request('http://localhost/api/storage/webdav/my-bucket/file.txt')
    const lock = createLock({
      request,
      bucketName: 'my-bucket',
      objectKey: 'file.txt',
      owner: 'test-owner',
      depth: '0',
      scope: 'exclusive',
    })

    if (lock === 'conflict') {
      throw new Error('Lock creation failed unexpectedly')
    }

    // 1. Refreshing with wrong path should return null
    const wrongRefreshRequest = new Request('http://localhost/api/storage/webdav/my-bucket/wrong.txt', {
      headers: { 'if': `(<${lock.token}>)` },
    })
    const refreshedNull = refreshLock(wrongRefreshRequest, 'my-bucket', 'wrong.txt')
    expect(refreshedNull).toBeNull()

    // 2. Refreshing with correct path should succeed
    const correctRefreshRequest = new Request('http://localhost/api/storage/webdav/my-bucket/file.txt', {
      headers: { 'if': `(<${lock.token}>)`, 'timeout': 'Second-60' },
    })
    const refreshed = refreshLock(correctRefreshRequest, 'my-bucket', 'file.txt')
    expect(refreshed).not.toBeNull()
    expect(refreshed?.timeoutSeconds).toBe(60)

    // 3. Unlocking with wrong path/bucket should fail
    const wrongUnlockRequest = new Request('http://localhost/api/storage/webdav/my-bucket/file.txt', {
      headers: { 'lock-token': `<${lock.token}>` },
    })
    const wrongUnlocked = unlock(wrongUnlockRequest, 'other-bucket', 'file.txt')
    expect(wrongUnlocked).toBe(false)

    // 4. Unlocking with correct credentials should succeed
    const correctUnlockRequest = new Request('http://localhost/api/storage/webdav/my-bucket/file.txt', {
      headers: { 'lock-token': `<${lock.token}>` },
    })
    const unlocked = unlock(correctUnlockRequest, 'my-bucket', 'file.txt')
    expect(unlocked).toBe(true)
  })
})
