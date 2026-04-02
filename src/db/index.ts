import { drizzle } from 'drizzle-orm/node-postgres'

import * as baseSchema from './schema/schema.ts'
import * as authSchema from './schema/auth-schema.ts'
import * as storageSchema from './schema/storage.ts'
import * as storageProviderSchema from './schema/storage-provider.ts'
import * as s3GatewaySchema from './schema/s3-gateway.ts'
import { env } from 'cloudflare:workers'
import { Pool } from 'pg'

const connectionString = env.DB?.connectionString ?? process.env.DATABASE_URL
if ( !connectionString ) {
    throw new Error( 'Database connection string is not configured. Set Hyperdrive binding `DB` or `DATABASE_URL`.' )
}

const pool = new Pool( {
    connectionString,
    max: Number( process.env.DATABASE_POOL_MAX ?? 2 ),
    idleTimeoutMillis: Number( process.env.DATABASE_POOL_IDLE_TIMEOUT_MS ?? 5000 ),
    connectionTimeoutMillis: Number( process.env.DATABASE_POOL_CONNECTION_TIMEOUT_MS ?? 10000 ),
} )

export const db = drizzle( pool, {
    schema: {
        ...baseSchema,
        ...authSchema,
        ...storageSchema,
        ...storageProviderSchema,
        ...s3GatewaySchema,
    },
} )