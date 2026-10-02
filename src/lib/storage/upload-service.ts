import type { QueryClient } from '@tanstack/react-query'
import { toast } from '@/components/ui/sonner'
import { uploadBatch } from '@/lib/upload-utils'
import { formatFileSize } from '@/lib/file-utils'
import { uploadFolder, uploadFolderFromFiles } from '@/lib/folder-upload-utils'
import { runScheduledFolderUploads } from '@/lib/folder-upload-scheduler'
import type { FolderUploadSource } from '@/lib/drop-upload-classifier'
import { addUploads, setUploads } from '@/stores/upload-store'
import { addFolderItem, refreshFolder } from '@/lib/storage/folder-query'
import type { UploadingFile } from '@/types/storage'

/**
 * The one place that starts uploads. Used by the upload dialogs and by
 * drag-and-drop, so they all behave the same:
 *   1. files over the size limit are rejected with a toast,
 *   2. progress appears in the upload widget (upload store),
 *   3. finished files are inserted into the folder's query cache right away,
 *   4. the folder and quota are refetched at the end.
 */

const FILE_CONCURRENCY = 3

export type UploadContext = {
  userId: string
  folderId: string | null
  fileSizeLimit: number | null
  queryClient: QueryClient
}

/** Splits off files that exceed the limit and tells the user about them. */
export function rejectOversizedFiles(
  files: File[],
  fileSizeLimit: number | null,
): File[] {
  if (!fileSizeLimit) return files
  const oversized = files.filter((file) => file.size > fileSizeLimit)
  if (oversized.length > 0) {
    const names = oversized.slice(0, 3).map((file) => file.name)
    if (oversized.length > 3) names.push(`and ${oversized.length - 3} more`)
    toast.error(
      `${oversized.length} file${oversized.length > 1 ? 's' : ''} exceed the ${formatFileSize(fileSizeLimit)} limit: ${names.join(', ')}`,
    )
  }
  return files.filter((file) => file.size <= fileSizeLimit)
}

export async function uploadFiles(files: File[], ctx: UploadContext) {
  const allowed = rejectOversizedFiles(files, ctx.fileSizeLimit)
  if (allowed.length === 0) return

  const entries: UploadingFile[] = allowed.map((file) => ({
    id: crypto.randomUUID(),
    file,
    progress: 0,
    status: 'uploading',
    targetFolderId: ctx.folderId,
  }))
  addUploads(entries)

  const uploadedCount = await uploadBatch(
    entries.map((entry) => ({ id: entry.id, file: entry.file! })),
    ctx.userId,
    ctx.folderId,
    FILE_CONCURRENCY,
    (uploaded) => {
      addFolderItem(ctx.queryClient, ctx.folderId, {
        ...uploaded,
        type: 'file',
        userId: ctx.userId,
        folderId: ctx.folderId,
        updatedAt: uploaded.createdAt,
      })
    },
  )

  if (uploadedCount > 0) {
    toast.success(
      `${uploadedCount} file${uploadedCount > 1 ? 's' : ''} uploaded`,
    )
  }
  if (uploadedCount < entries.length) {
    toast.error(
      `${entries.length - uploadedCount} upload${entries.length - uploadedCount > 1 ? 's' : ''} failed. Retry from the upload panel.`,
    )
  }
  await refreshFolder(ctx.queryClient, ctx.folderId)
}

export async function uploadFolders(
  sources: FolderUploadSource[],
  ctx: UploadContext,
) {
  if (sources.length === 0) return

  const results = await runScheduledFolderUploads({
    sources,
    uploadFolder: async (source, fileConcurrency) => {
      const result =
        source.type === 'entry'
          ? await uploadFolder(source.entry, ctx.userId, ctx.folderId, setUploads, {
              fileConcurrency,
            })
          : await uploadFolderFromFiles({
              folderName: source.folderName,
              files: source.files,
              userId: ctx.userId,
              parentFolderId: ctx.folderId,
              setUploads,
              options: { fileConcurrency },
            })
      return {
        folderName:
          result.folderName ??
          (source.type === 'entry' ? source.entry.name : source.folderName),
        filesCount: result.filesCount ?? 0,
        success: result.success,
        error: result.error,
      }
    },
  })

  for (const result of results) {
    if (result.success) {
      toast.success(
        `Folder "${result.folderName}" uploaded (${result.filesCount} files)`,
      )
    } else {
      toast.error(
        `Folder "${result.folderName}" failed: ${result.error ?? 'Unknown error'}`,
      )
    }
  }
  await refreshFolder(ctx.queryClient, ctx.folderId)
}
