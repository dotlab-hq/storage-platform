export interface QueueClient {
  send: (body: string) => Promise<unknown>
}

export async function getTrashDeletionDO(env: Env) {
  const id = env.TRASH_DELETION_STATE.idFromName('trash-deletion-state')
  return env.TRASH_DELETION_STATE.get(id)
}
