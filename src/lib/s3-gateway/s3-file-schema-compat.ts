import { sql } from "drizzle-orm"
import { db } from "@/db"

type SqliteColumnInfo = {
    name: string
}

type MissingColumn = {
    name: string
    statement: ReturnType<typeof sql>
}

const REQUIRED_FILE_COLUMNS: MissingColumn[] = [
    { name: "etag", statement: sql`ALTER TABLE "file" ADD COLUMN "etag" text` },
    { name: "cache_control", statement: sql`ALTER TABLE "file" ADD COLUMN "cache_control" text` },
    { name: "last_modified", statement: sql`ALTER TABLE "file" ADD COLUMN "last_modified" integer` },
    { name: "is_deleted", statement: sql`ALTER TABLE "file" ADD COLUMN "is_deleted" integer DEFAULT 0 NOT NULL` },
    { name: "deleted_at", statement: sql`ALTER TABLE "file" ADD COLUMN "deleted_at" integer` },
    { name: "updated_at", statement: sql`ALTER TABLE "file" ADD COLUMN "updated_at" integer DEFAULT 0` },
]

let ensurePromise: Promise<void> | null = null

async function applyMissingFileColumns(): Promise<void> {
    const tableInfo = await db.all<SqliteColumnInfo>( sql`PRAGMA table_info("file")` )
    const existingColumns = new Set( tableInfo.map( ( column ) => column.name ) )

    for ( const required of REQUIRED_FILE_COLUMNS ) {
        if ( existingColumns.has( required.name ) ) {
            continue
        }
        await db.run( required.statement )
        existingColumns.add( required.name )
        console.warn( `[S3 Gateway] Added missing file table column: ${required.name}` )
    }
}

export async function ensureS3FileSchemaCompatibility(): Promise<void> {
    if ( ensurePromise ) {
        return ensurePromise
    }

    ensurePromise = applyMissingFileColumns().catch( ( error: unknown ) => {
        ensurePromise = null
        throw error
    } )

    return ensurePromise
}
