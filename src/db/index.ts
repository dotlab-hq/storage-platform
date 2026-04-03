import { drizzle } from 'drizzle-orm/d1'

import * as baseSchema from './schema/schema.ts'
import * as authSchema from './schema/auth-schema.ts'
import * as storageSchema from './schema/storage.ts'
import * as storageProviderSchema from './schema/storage-provider.ts'
import * as s3GatewaySchema from './schema/s3-gateway.ts'
import { env } from 'cloudflare:workers'




export const db = drizzle( env.DB_D1, {
    schema: {
        ...baseSchema,
        ...authSchema,
        ...storageSchema,
        ...storageProviderSchema,
        ...s3GatewaySchema,
    },
} )