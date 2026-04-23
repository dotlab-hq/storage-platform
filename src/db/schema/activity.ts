import { integer, index, text } from 'drizzle-orm/sqlite-core'
import { user } from './auth-schema'
import { schema } from './schema'

export const userActivity = schema.table(
  'user_activity',
  {
    id: text( 'id' )
      .$defaultFn( () => crypto.randomUUID() )
      .primaryKey(),
    userId: text( 'user_id' )
      .notNull()
      .references( () => user.id, { onDelete: 'cascade' } ),
    eventType: text( 'event_type' ).notNull(),
    resourceType: text( 'resource_type' ),
    resourceId: text( 'resource_id' ),
    metadata: text( 'metadata' ).default( '{}' ),
    ipAddress: text( 'ip_address' ),
    userAgent: text( 'user_agent' ),
    createdAt: integer( 'created_at', { mode: 'timestamp' } )
      .$defaultFn( () => new Date() )
      .notNull(),
  },
  ( table ) => [
    index( 'activity_userId_idx' ).on( table.userId ),
    index( 'activity_createdAt_idx' ).on( table.createdAt ),
  ],
)

export const activityTag = schema.table(
  'activity_tag',
  {
    id: integer( 'id' ).primaryKey( { autoIncrement: true } ),
    activityId: text( 'activity_id' )
      .notNull()
      .references( () => userActivity.id, { onDelete: 'cascade' } ),
    tag: text( 'tag' ).notNull(),
  },
  ( table ) => [
    index( 'tag_tag_idx' ).on( table.tag ),
    index( 'tag_activityId_idx' ).on( table.activityId ),
  ],
)
