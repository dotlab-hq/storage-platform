import { drizzle } from 'drizzle-orm/node-postgres'

import * as baseSchema from './schema/schema.ts'
import * as authSchema from './schema/auth-schema.ts'
import * as storageSchema from './schema/storage.ts'
import * as storageProviderSchema from './schema/storage-provider.ts'
import * as s3GatewaySchema from './schema/s3-gateway.ts'

export const db = drizzle( process.env.DATABASE_URL!, {
    schema: {
        ...baseSchema,
        ...authSchema,
        ...storageSchema,
        ...storageProviderSchema,
        ...s3GatewaySchema,
    },
} )