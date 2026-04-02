import { drizzle } from 'drizzle-orm/node-postgres'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import * as baseSchema from './schema/schema'
import * as authSchema from './schema/auth-schema'
import * as storageSchema from './schema/storage'
import * as storageProviderSchema from './schema/storage-provider'
import * as s3GatewaySchema from './schema/s3-gateway'
import { getRequest } from '@tanstack/react-start/server'
import type { Env } from '@/types'

const dbSchema = {
    ...baseSchema,
    ...authSchema,
    ...storageSchema,
    ...storageProviderSchema,
    ...s3GatewaySchema,
}

type DbClient = NodePgDatabase<typeof dbSchema>

type RuntimeCloudflare = {
    runtime?: {
        cloudflare?: {
            env?: Env
        }
    }
}

type EventCloudflare = {
    req?: {
        runtime?: {
            cloudflare?: {
                env?: Env
            }
        }
    }
}

type PoolCacheEntry = {
    pool: Pool
    db: DbClient
}

const dbCache = new Map<string, PoolCacheEntry>()





function getCloudflareEnvFromRequest( request?: Request ): Env | undefined {
    const runtimeRequest = request as Request & RuntimeCloudflare
    return runtimeRequest.runtime?.cloudflare?.env
}

function getCloudflareEnvFromEvent( event?: EventCloudflare ): Env | undefined {
    return event?.req?.runtime?.cloudflare?.env
}

function getCurrentRequestEnv(): Env | undefined {
    try {
        const request = getRequest()
        return getCloudflareEnvFromRequest( request )
    } catch ( _error: unknown ) {
        return undefined
    }
}

function getConnectionString( env?: Env ): string {
    const resolvedEnv = env ?? getCurrentRequestEnv()
    if ( resolvedEnv?.DB?.connectionString ) return resolvedEnv.DB.connectionString
    if ( resolvedEnv?.HYPERDRIVE?.connectionString ) return resolvedEnv.HYPERDRIVE.connectionString
    if ( resolvedEnv?.DATABASE_URL ) return resolvedEnv.DATABASE_URL
    if ( process.env.DATABASE_URL ) return process.env.DATABASE_URL

    throw new Error( 'No database connection string found' )
}

export function getDb( env?: Env ): DbClient {
    const url = getConnectionString( env )
    const cached = dbCache.get( url )
    if ( cached ) {
        return cached.db
    }

    const pool = new Pool( {
        connectionString: url,
        max: Number( process.env.DATABASE_POOL_MAX ?? 2 ),
        idleTimeoutMillis: Number( process.env.DATABASE_POOL_IDLE_TIMEOUT_MS ?? 5000 ),
        connectionTimeoutMillis: Number( process.env.DATABASE_POOL_CONNECTION_TIMEOUT_MS ?? 10000 ),
    } )

    const db = drizzle( pool, { schema: dbSchema } )
    dbCache.set( url, { pool, db } )
    return db
}

export function getDbFromRequest( request?: Request ): DbClient {
    return getDb( getCloudflareEnvFromRequest( request ) )
}

export function getDbFromEvent( event?: EventCloudflare ): DbClient {
    return getDb( getCloudflareEnvFromEvent( event ) )
}

const dbProxyHandler: ProxyHandler<DbClient> = {
    get( _target, property, receiver ) {
        const resolvedDb = getDb()
        return Reflect.get( resolvedDb, property, receiver )
    },
}

export const db = new Proxy( {} as DbClient, dbProxyHandler )