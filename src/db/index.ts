import { drizzle } from 'drizzle-orm/node-postgres'

import * as baseSchema from './schema/schema.ts'
import * as authSchema from './schema/auth-schema.ts'
import * as storageSchema from './schema/storage.ts'
import * as storageProviderSchema from './schema/storage-provider.ts'
import * as s3GatewaySchema from './schema/s3-gateway.ts'
import { env } from 'cloudflare:workers'
import { Client } from 'pg'


const client = new Client({ connectionString: env.DB.connectionString })
export const db = drizzle( client, {
    schema: {
        ...baseSchema,
        ...authSchema,
        ...storageSchema,
        ...storageProviderSchema,
        ...s3GatewaySchema,
    },
} )