/// <reference types="cloudflare:workers" />
import type { TrashDeletionStateDO } from '@/lib/trash-deletion/trash-deletion-do'

declare global {
  namespace Cloudflare {
    interface Env {
      TRASH_DELETION_QUEUE: Queue
      TRASH_DELETION_WORKFLOW: Workflow<DeletionWorkflowParams>
      TRASH_DELETION_STATE: DurableObjectNamespace<TrashDeletionStateDO>
    }
  }
}

export {}
