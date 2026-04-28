import type { FolderUploadSource } from '@/lib/drop-upload-classifier'

type FolderPlan = {
  source: FolderUploadSource
  folderName: string
  fileCount: number
}

type SchedulerOptions<TResult> = {
  sources: FolderUploadSource[]
  uploadFolder: (
    source: FolderUploadSource,
    fileConcurrency: number,
  ) => Promise<TResult>
  singleFolderConcurrency?: number
  totalParallelFiles?: number
}

async function listDirectoryEntries(
  directory: FileSystemDirectoryEntry,
): Promise<FileSystemEntry[]> {
  const reader = directory.createReader()
  const entries: FileSystemEntry[] = []

  while (true) {
    const batch = await new Promise<FileSystemEntry[]>((resolve, reject) => {
      reader.readEntries(resolve, reject)
    })
    if (batch.length === 0) break
    entries.push(...batch)
  }

  return entries
}

async function countDirectoryFiles(
  directory: FileSystemDirectoryEntry,
): Promise<number> {
  const entries = await listDirectoryEntries(directory)
  let count = 0

  for (const entry of entries) {
    if (entry.isFile) {
      count += 1
      continue
    }

    if (entry.isDirectory) {
      count += await countDirectoryFiles(entry as FileSystemDirectoryEntry)
    }
  }

  return count
}

async function buildFolderPlan(
  source: FolderUploadSource,
): Promise<FolderPlan> {
  if (source.type === 'files') {
    return {
      source,
      folderName: source.folderName,
      fileCount: source.files.length,
    }
  }

  return {
    source,
    folderName: source.entry.name,
    fileCount: await countDirectoryFiles(source.entry),
  }
}

function allocateWeightedConcurrency(
  fileCounts: number[],
  totalConcurrency: number,
): number[] {
  if (fileCounts.length === 0) return []

  const base = new Array<number>(fileCounts.length).fill(1)
  let remaining = Math.max(0, totalConcurrency - fileCounts.length)

  if (remaining === 0) {
    return base
  }

  const totalFiles = fileCounts.reduce((sum, count) => sum + count, 0)
  if (totalFiles <= 0) {
    return base
  }

  const capacities = fileCounts.map((count) => Math.max(0, count - 1))
  const extras = new Array<number>(fileCounts.length).fill(0)
  const remainders = new Array<number>(fileCounts.length).fill(0)

  for (let index = 0; index < fileCounts.length; index += 1) {
    const rawShare = (fileCounts[index] / totalFiles) * remaining
    const floored = Math.min(capacities[index], Math.floor(rawShare))
    extras[index] = floored
    remainders[index] = rawShare - floored
  }

  remaining -= extras.reduce((sum, value) => sum + value, 0)

  while (remaining > 0) {
    let bestIndex = -1
    let bestRemainder = -1

    for (let index = 0; index < fileCounts.length; index += 1) {
      if (extras[index] >= capacities[index]) continue
      if (remainders[index] > bestRemainder) {
        bestRemainder = remainders[index]
        bestIndex = index
      }
    }

    if (bestIndex === -1) break

    extras[bestIndex] += 1
    remainders[bestIndex] = 0
    remaining -= 1
  }

  return base.map((value, index) => value + extras[index])
}

export async function runScheduledFolderUploads<TResult>({
  sources,
  uploadFolder,
  singleFolderConcurrency = 8,
  totalParallelFiles = 12,
}: SchedulerOptions<TResult>): Promise<TResult[]> {
  if (sources.length === 0) return []

  if (sources.length === 1) {
    return [await uploadFolder(sources[0], singleFolderConcurrency)]
  }

  const plans = await Promise.all(
    sources.map((source) => buildFolderPlan(source)),
  )

  const orderedPlans =
    plans.length > totalParallelFiles
      ? [...plans].sort((left, right) => {
          if (left.fileCount !== right.fileCount) {
            return left.fileCount - right.fileCount
          }
          return left.folderName.localeCompare(right.folderName)
        })
      : plans

  const results: TResult[] = []

  for (
    let start = 0;
    start < orderedPlans.length;
    start += totalParallelFiles
  ) {
    const batch = orderedPlans.slice(start, start + totalParallelFiles)
    const fileCounts = batch.map((plan) => plan.fileCount)
    const allocatedConcurrency = allocateWeightedConcurrency(
      fileCounts,
      totalParallelFiles,
    )

    const batchResults = await Promise.all(
      batch.map((plan, index) =>
        uploadFolder(plan.source, Math.max(1, allocatedConcurrency[index])),
      ),
    )

    results.push(...batchResults)
  }

  return results
}
