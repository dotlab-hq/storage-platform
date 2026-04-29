import type { TrashDeletionItem } from './params'

export interface QueueClient {
  send: (msg: TrashDeletionItem) => Promise<unknown>
}

export async function getTrashDeletionDO(env: Env) {
  const id = env.TRASH_DELETION_STATE.idFromName('trash-deletion-state')
  return env.TRASH_DELETION_STATE.get(id)
}
