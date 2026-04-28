export type TrashDeletionItem = {
  userId: string
  itemId: string
  itemType: 'file' | 'folder'
}

export type DeletionWorkflowParams = {
  items: TrashDeletionItem[]
}

export const BATCH_SIZE = 75
