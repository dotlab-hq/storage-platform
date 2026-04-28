/// <reference types="cloudflare:workers" />

declare global {
  namespace Cloudflare {
    interface Env {
      TRASH_DELETION_QUEUE: Queue
      TRASH_DELETION_WORKFLOW: Workflow<DeletionWorkflowParams>
    }
  }
}

export {}
