import { PgSchema, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const schema = new PgSchema( "dot-storage" )


export const todos = schema.table( 'todos', {
  id: serial().primaryKey(),
  title: text().notNull(),
  createdAt: timestamp( 'created_at' ).defaultNow(),
} )
