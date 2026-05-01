// @ts-nocheck
import { Store } from '@tanstack/store'
import { useStore } from '@tanstack/react-store'
import type { UploadingFile } from '@/types/storage'

export type UploadState = {
  uploads: UploadingFile[]
}

const initialState: UploadState = {
  uploads: [],
}

/**
 * Global store for tracking upload progress across the application.
 * Similar to Google Drive's upload widget, this maintains a list of
 * all ongoing, completed, and failed uploads.
 */
export const uploadStore = new Store<UploadState>(initialState)

/**
 * Hook to access upload state from any component
 */
export function useUploadStore<T>(selector: (state: UploadState) => T): T {
  return useStore(uploadStore, selector)
}

/**
 * Add a new upload to the store
 */
export function addUpload(upload: UploadingFile): void {
  uploadStore.setState((state) => ({
    uploads: [...state.uploads, upload],
  }))
}

/**
 * Update an existing upload's properties
 */
export function updateUpload(
  id: string,
  updates: Partial<Omit<UploadingFile, 'id'>>,
): void {
  uploadStore.setState((state) => ({
    uploads: state.uploads.map((u) => (u.id === id ? { ...u, ...updates } : u)),
  }))
}

/**
 * Remove an upload from the store
 */
export function removeUpload(id: string): void {
  uploadStore.setState((state) => ({
    uploads: state.uploads.filter((u) => u.id !== id),
  }))
}

/**
 * Remove all uploads that belong to a folder root upload.
 */
export function removeUploadsByFolderRoot(folderUploadRootId: string): void {
  uploadStore.setState((state) => ({
    uploads: state.uploads.filter(
      (u) => u.folderUploadRootId !== folderUploadRootId,
    ),
  }))
}

/**
 * Remove an upload and all its child uploads (e.g., files in a folder upload)
 */
export function removeUploadWithChildren(id: string): void {
  uploadStore.setState((state) => {
    const childIds = new Set(
      state.uploads.filter((u) => u.parentUploadId === id).map((u) => u.id),
    )
    return {
      uploads: state.uploads.filter((u) => u.id !== id && !childIds.has(u.id)),
    }
  })
}

/**
 * Clear all uploads from the store
 */
export function clearUploads(): void {
  uploadStore.setState({ uploads: [] })
}

/**
 * Get count of active uploads (uploading status only)
 */
export function getActiveUploadCount(): number {
  return uploadStore.getState().uploads.filter((u) => u.status === 'uploading')
    .length
}

/**
 * Retry a failed upload - convenience function for components
 */
export function retryUpload(id: string): void {
  uploadStore.setState((state) => ({
    uploads: state.uploads.map((u) =>
      u.id === id
        ? { ...u, status: 'uploading' as const, error: undefined, progress: 0 }
        : u,
    ),
  }))
}
