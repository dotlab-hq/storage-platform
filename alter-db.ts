import 'dotenv/config'
import { sql } from 'drizzle-orm'
import { db } from './src/db/index.ts'

async function main() {
  try {
    await db.run(sql`ALTER TABLE webrtc_transfer ADD COLUMN owner_signal TEXT;`)
    console.log('Added owner_signal')
  } catch (e) {
    console.error(e)
  }
  try {
    await db.run(
      sql`ALTER TABLE webrtc_transfer ADD COLUMN scanner_signal TEXT;`,
    )
    console.log('Added scanner_signal')
  } catch (e) {
    console.error(e)
  }
}

main()
