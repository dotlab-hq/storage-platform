import type { WorkflowEvent, WorkflowStep } from 'cloudflare:workers'
import { WorkflowEntrypoint } from 'cloudflare:workers'
import { deleteFile } from './deletion-processor'
import { deleteFolder } from './folder-deletion'
import type { DeletionWorkflowParams, TrashDeletionItem } from './params'

export class TrashDeletionWorkflow extends WorkflowEntrypoint<
  Env,
  DeletionWorkflowParams
> {
  async run(
    event: Readonly<WorkflowEvent<DeletionWorkflowParams>>,
    step: WorkflowStep,
  ): Promise<void> {
    const items = event.payload?.items
    if (!items || items.length === 0) {
      console.log('[Workflow] No items provided, exiting')
      return
    }

    const env = this.env as Env
    console.log(`[Workflow] Starting deletion batch for ${items.length} items`)

    let fileCount = 0
    let folderCount = 0
    let errorCount = 0

    // Process each item as an independent step with retry
    for (const item of items) {
      try {
        if (item.itemType === 'file') {
          await step.do('delete-file', async () => {
            console.log('[Workflow Step] Deleting file:', item.itemId)
            await deleteFile(env, item)
            fileCount++
          })
        } else {
          await step.do('delete-folder', async () => {
            console.log('[Workflow Step] Deleting folder:', item.itemId)
            await deleteFolder(env, item)
            folderCount++
          })
        }
      } catch (error) {
        errorCount++
        console.error(
          `[Workflow Step] Failed to delete ${item.itemType} ${item.itemId}:`,
          error,
        )
        // Re-throw to trigger step retry with backoff
        throw error
      }
    }

    // Final checkpoint: clean up completed folders
    try {
      await step.do('cleanup-folders', async () => {
        const { checkAndDeleteCompletedFolders } =
          await import('./folder-deletion')
        const folderDeletions = await checkAndDeleteCompletedFolders(env)
        if (folderDeletions > 0) {
          console.log(
            `[Workflow] Completed ${folderDeletions} pending folder deletions`,
          )
        }
      })
    } catch (error) {
      console.error('[Workflow] Folder cleanup failed:', error)
      // Don't fail entire batch for cleanup errors
    }

    console.log(
      `[Workflow] Batch complete: ${fileCount} files, ${folderCount} folders, ${errorCount} errors`,
    )
  }
}
