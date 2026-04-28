import type { DurableObject } from 'cloudflare:workers'

export interface TrashDeletionState {
  processedChildren: Record<string, string[]> // folderId -> array of processed child IDs
  enqueuedChildren: Record<string, string[]> // folderId -> array of child IDs enqueued
  pendingFolderCompletion: string[] // folderIds that are waiting for children to be processed
}

export class TrashDeletionStateDO implements DurableObject {
  state: DurableObjectState
  storage: DurableObjectStorage

  constructor(state: DurableObjectState, _env: Env) {
    this.state = state
    this.storage = state.storage
  }

  async getState(): Promise<TrashDeletionState> {
    const processed =
      await this.storage.get<Record<string, string[]>>('processedChildren')
    const enqueued =
      await this.storage.get<Record<string, string[]>>('enqueuedChildren')
    const pending = await this.storage.get<string[]>('pendingFolderCompletion')

    return {
      processedChildren: processed ?? {},
      enqueuedChildren: enqueued ?? {},
      pendingFolderCompletion: pending ?? [],
    }
  }

  async saveState(state: TrashDeletionState): Promise<void> {
    await this.storage.put('processedChildren', state.processedChildren)
    await this.storage.put('enqueuedChildren', state.enqueuedChildren)
    await this.storage.put(
      'pendingFolderCompletion',
      state.pendingFolderCompletion,
    )
  }

  async enqueueChildrenForFolder(
    folderId: string,
    childFileIds: string[],
    childFolderIds: string[],
  ): Promise<void> {
    const state = await this.getState()

    const allChildIds = [...childFileIds, ...childFolderIds]
    state.enqueuedChildren[folderId] = [
      ...(state.enqueuedChildren[folderId] ?? []),
      ...allChildIds,
    ]

    if (childFolderIds.length > 0) {
      state.pendingFolderCompletion.push(...childFolderIds)
    }

    await this.saveState(state)
  }

  async markChildProcessed(
    parentFolderId: string | null,
    childId: string,
  ): Promise<boolean> {
    if (!parentFolderId) return true

    const state = await this.getState()

    state.processedChildren[parentFolderId] = [
      ...(state.processedChildren[parentFolderId] ?? []),
      childId,
    ]

    await this.saveState(state)

    return this.checkFolderCompletion(parentFolderId)
  }

  async checkFolderCompletion(folderId: string): Promise<boolean> {
    const state = await this.getState()

    const enqueued = state.enqueuedChildren[folderId] ?? []
    const processed = state.processedChildren[folderId] ?? []

    const enqueuedSet = new Set(enqueued)
    const processedSet = new Set(processed)

    for (const id of enqueued) {
      if (!processedSet.has(id)) {
        return false
      }
    }

    return enqueued.length > 0 && processed.length === enqueuedSet.size
  }

  async getFolderChildrenToEnqueue(
    folderId: string,
  ): Promise<{ fileIds: string[]; folderIds: string[] } | null> {
    const state = await this.getState()

    const enqueued = state.enqueuedChildren[folderId] ?? []
    const processed = state.processedChildren[folderId] ?? []

    const pendingEnqueue: string[] = []

    for (const id of enqueued) {
      if (!processed.includes(id)) {
        pendingEnqueue.push(id)
      }
    }

    const fileIds = pendingEnqueue.filter((id) => !state.enqueuedChildren[id])
    const folderIds = pendingEnqueue.filter(
      (id) => state.enqueuedChildren[id] !== undefined,
    )

    return { fileIds, folderIds }
  }

  async isFolderReadyForDeletion(folderId: string): Promise<boolean> {
    return this.checkFolderCompletion(folderId)
  }

  async clearFolderState(folderId: string): Promise<void> {
    const state = await this.getState()

    delete state.processedChildren[folderId]
    delete state.enqueuedChildren[folderId]
    state.pendingFolderCompletion = state.pendingFolderCompletion.filter(
      (id) => id !== folderId,
    )

    await this.saveState(state)
  }

  async getPendingFolderCompletions(): Promise<string[]> {
    const state = await this.getState()
    return state.pendingFolderCompletion.filter((folderId) =>
      this.checkFolderCompletion(folderId),
    )
  }
}

export type TrashDeletionDO = {
  enqueueChildrenForFolder: (
    folderId: string,
    childFileIds: string[],
    childFolderIds: string[],
  ) => Promise<void>
  markChildProcessed: (
    parentFolderId: string | null,
    childId: string,
  ) => Promise<boolean>
  isFolderReadyForDeletion: (folderId: string) => Promise<boolean>
  clearFolderState: (folderId: string) => Promise<void>
  getPendingFolderCompletions: () => Promise<string[]>
  getFolderChildrenToEnqueue: (
    folderId: string,
  ) => Promise<{ fileIds: string[]; folderIds: string[] } | null>
}
