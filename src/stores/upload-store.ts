import { create } from 'zustand'
import type { UploadingFile } from '@/types/storage'

/**
 * Global upload queue (shown by the floating upload widget).
 *
 * Any component can read it with `useUploadStore(selector)`; non-React code
 * (upload workers in `lib/upload-utils.ts`) uses the plain functions below.
 */
type UploadState = {
  uploads: UploadingFile[]
}

export const useUploadStore = create<UploadState>(() => ({ uploads: [] }))

type UploadsUpdater =
  | UploadingFile[]
  | ((previous: UploadingFile[]) => UploadingFile[])

/** React-style setter, handy to pass to helpers that expect `setUploads`. */
export function setUploads(updater: UploadsUpdater): void {
  useUploadStore.setState((state) => ({
    uploads: typeof updater === 'function' ? updater(state.uploads) : updater,
  }))
}

export function getUploads(): UploadingFile[] {
  return useUploadStore.getState().uploads
}

export function addUploads(uploads: UploadingFile[]): void {
  setUploads((previous) => [...uploads, ...previous])
}

export function updateUpload(
  id: string,
  updates: Partial<Omit<UploadingFile, 'id'>>,
): void {
  setUploads((previous) =>
    previous.map((upload) =>
      upload.id === id ? { ...upload, ...updates } : upload,
    ),
  )
}

export function removeUpload(id: string): void {
  setUploads((previous) => previous.filter((upload) => upload.id !== id))
}

/** Removes a folder upload entry together with its per-file child entries. */
export function removeUploadWithChildren(id: string): void {
  setUploads((previous) =>
    previous.filter(
      (upload) => upload.id !== id && upload.parentUploadId !== id,
    ),
  )
}

export function clearCompletedUploads(): void {
  setUploads((previous) =>
    previous.filter((upload) => upload.status !== 'completed'),
  )
}
