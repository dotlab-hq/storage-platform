import handler from "@tanstack/react-start/server-entry";
import { TrashDeletionWorkflow, queue as trashQueue } from "./workers/trash-queue-consumer";
import { scheduled as trashCron } from "./workers/trash-cron";

// Export Durable Objects as named exports
// Export the workflow class so Wrangler can bind it
export { TrashDeletionWorkflow } from "./workers/trash-queue-consumer";

export default {
    fetch: handler.fetch,

    // Handle Queue messages. Route to the trash deletion consumer when available.
    async queue( batch, env, ctx ) {
        // If the trash workflow binding is present, use the specialized consumer.
        if ( env && Object.prototype.hasOwnProperty.call( env, 'TRASH_DELETION_WORKFLOW' ) ) {
            try {
                await trashQueue( batch.messages, env, ctx )
                // Acknowledge messages only after successful processing
                for ( const message of batch.messages ) {
                    message.ack()
                }
                return
            } catch ( err ) {
                console.error( 'Trash queue consumer failed:', err )
                // Rethrow so the runtime can retry the batch
                throw err
            }
        }

        // Fallback generic queue handler
        for ( const message of batch.messages ) {
            console.log( "Processing message:", message.body );
            message.ack();
        }
    },

    // Handle Cron Triggers — delegate to the trash cron when the workflow binding is available.
    async scheduled( event, env, ctx ) {
        if ( env && Object.prototype.hasOwnProperty.call( env, 'TRASH_DELETION_WORKFLOW' ) ) {
            try {
                await trashCron( event, env, ctx )
                return
            } catch ( err ) {
                console.error( 'Trash cron failed:', err )
                throw err
            }
        }
        console.log( "Cron triggered:", event.cron );
    },

    TrashDeletionWorkflow
};