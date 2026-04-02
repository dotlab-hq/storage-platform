import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import * as baseSchema from './schema/schema.ts'
import * as authSchema from './schema/auth-schema.ts'
import * as storageSchema from './schema/storage.ts'
import * as storageProviderSchema from './schema/storage-provider.ts'
import * as s3GatewaySchema from './schema/s3-gateway.ts'

const DATABASE_URL = process.env.DATABASE_URL

if ( !DATABASE_URL ) {
    throw new Error( 'Missing DATABASE_URL environment variable' )
}

const DRIZZLE_SCHEMA = {
    ...baseSchema,
    ...authSchema,
    ...storageSchema,
    ...storageProviderSchema,
    ...s3GatewaySchema,
}

type GlobalWithPgPool = typeof globalThis & {
    __storagePgPool?: Pool
}

function parsePositiveInt( value: string | undefined, fallback: number ): number {
    const parsed = Number( value )
    if ( !Number.isFinite( parsed ) || parsed <= 0 ) {
        return fallback
    }
    return Math.floor( parsed )
}

const poolMax = parsePositiveInt( process.env.DATABASE_POOL_MAX, 2 )
const poolIdleTimeoutMs = parsePositiveInt( process.env.DATABASE_POOL_IDLE_TIMEOUT_MS, 5_000 )
const poolConnectionTimeoutMs = parsePositiveInt( process.env.DATABASE_POOL_CONNECTION_TIMEOUT_MS, 10_000 )

const globalWithPgPool = globalThis as GlobalWithPgPool

const pool = globalWithPgPool.__storagePgPool
    ?? new Pool( {
        connectionString: DATABASE_URL,
        max: poolMax,
        idleTimeoutMillis: poolIdleTimeoutMs,
        connectionTimeoutMillis: poolConnectionTimeoutMs,
    } )

if ( process.env.NODE_ENV !== 'production' ) {
    globalWithPgPool.__storagePgPool = pool
}

export const db = drizzle( pool, {
    schema: DRIZZLE_SCHEMA,
} )
