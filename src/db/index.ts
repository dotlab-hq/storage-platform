import { drizzle } from 'drizzle-orm/node-postgres'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import type { AsyncLocalStorage } from 'node:async_hooks'
import { Pool } from 'pg'

import * as baseSchema from './schema/schema.ts'
import * as authSchema from './schema/auth-schema.ts'
import * as storageSchema from './schema/storage.ts'
import * as storageProviderSchema from './schema/storage-provider.ts'
import * as s3GatewaySchema from './schema/s3-gateway.ts'

const dbSchema = {
    ...baseSchema,
    ...authSchema,
    ...storageSchema,
    ...storageProviderSchema,
    ...s3GatewaySchema,
}

type DbClient = NodePgDatabase<typeof dbSchema>

type HyperdriveBinding = {
    connectionString: string
}

type CloudflareRequestContext = {
    cloudflare?: {
        env?: {
            DB?: HyperdriveBinding
            HYPERDRIVE?: HyperdriveBinding
        }
    }
}

type StartStorageContext = {
    contextAfterGlobalMiddlewares?: CloudflareRequestContext
}

const poolCache = new Map<string, Pool>()
const dbCache = new Map<string, DbClient>()

const START_STORAGE_CONTEXT_KEY = Symbol.for( 'tanstack-start:start-storage-context' )

type StartStorageContextGlobal = typeof globalThis & {
    [START_STORAGE_CONTEXT_KEY]?: AsyncLocalStorage<StartStorageContext>
}

function isHyperdriveBinding( value: unknown ): value is HyperdriveBinding {
    if ( typeof value !== 'object' || value === null ) {
        return false
    }

    const candidate = value as { connectionString?: unknown }
    return typeof candidate.connectionString === 'string' && candidate.connectionString.length > 0
}

function getConnectionStringFromRequestContext(): string | null {
    const startStorage = ( globalThis as StartStorageContextGlobal )[START_STORAGE_CONTEXT_KEY]
    const startContext = startStorage?.getStore()
    const context = startContext?.contextAfterGlobalMiddlewares

    const dbBinding = context?.cloudflare?.env?.DB
    if ( isHyperdriveBinding( dbBinding ) ) {
        return dbBinding.connectionString
    }

    const hyperdriveBinding = context?.cloudflare?.env?.HYPERDRIVE
    if ( isHyperdriveBinding( hyperdriveBinding ) ) {
        return hyperdriveBinding.connectionString
    }

    return null
}

function getConnectionString(): string {
    const runtimeConnectionString = getConnectionStringFromRequestContext()
    if ( runtimeConnectionString ) {
        return runtimeConnectionString
    }

    if ( process.env.DATABASE_URL ) {
        return process.env.DATABASE_URL
    }

    throw new Error( 'Database connection is not configured. Expected Cloudflare Hyperdrive binding (DB/HYPERDRIVE) or DATABASE_URL.' )
}

function createDbClient( connectionString: string ): DbClient {
    const existingDb = dbCache.get( connectionString )
    if ( existingDb ) {
        return existingDb
    }

    const pool = new Pool( { connectionString } )
    poolCache.set( connectionString, pool )

    const dbClient = drizzle( pool, { schema: dbSchema } )
    dbCache.set( connectionString, dbClient )
    return dbClient
}

export function getDb(): DbClient {
    return createDbClient( getConnectionString() )
}

export const db = new Proxy( {}, {
    get( _target, property, receiver ) {
        const activeDb = getDb() as unknown as object
        const value = Reflect.get( activeDb, property, receiver )
        return typeof value === 'function' ? value.bind( activeDb ) : value
    },
} ) as DbClient