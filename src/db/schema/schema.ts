import { sqliteTable } from 'drizzle-orm/sqlite-core'

export const schema = {
  table: sqliteTable,
}

// export const todos = schema.table( 'todos', {
//   id: serial().primaryKey(),
//   title: text().notNull(),
//   createdAt: timestamp( 'created_at' ).defaultNow(),
// } )
