import '@tanstack/react-start/server-only'
import { drizzle } from 'drizzle-orm/d1'

import * as baseSchema from './schema/schema.ts'
import * as authSchema from './schema/auth-schema.ts'
import * as storageSchema from './schema/storage.ts'
import * as storageProviderSchema from './schema/storage-provider.ts'
import * as s3GatewaySchema from './schema/s3-gateway.ts'
import * as s3ControlsSchema from './schema/s3-controls.ts'
import * as s3SecuritySchema from './schema/s3-security.ts'
import * as chatSchema from './schema/chat.ts'
import * as fileSummarySchema from './schema/file-summary.ts'
import * as activitySchema from './schema/activity.ts'
import { env } from 'cloudflare:workers'

export const db = drizzle(env.DB_D1, {
  schema: {
    ...baseSchema,
    ...authSchema,
    ...storageSchema,
    ...storageProviderSchema,
    ...s3GatewaySchema,
    ...s3ControlsSchema,
    ...s3SecuritySchema,
    ...chatSchema,
    ...fileSummarySchema,
    ...activitySchema,
  },
})
