import { bigint, boolean, index, text, timestamp } from "drizzle-orm/pg-core"
import { schema } from "./schema"

const DEFAULT_PROVIDER_LIMIT_BYTES = 50 * 1024 * 1024 * 1024

export const storageProvider = schema.table(
    "storage_provider",
    {
        id: text( "id" )
            .$defaultFn( () => crypto.randomUUID() )
            .primaryKey(),
        name: text( "name" ).notNull().unique(),
        endpoint: text( "endpoint" ).notNull(),
        region: text( "region" ).notNull(),
        bucketName: text( "bucket_name" ).notNull(),
        accessKeyIdEncrypted: text( "access_key_id_encrypted" ).notNull(),
        secretAccessKeyEncrypted: text( "secret_access_key_encrypted" ).notNull(),
        storageLimitBytes: bigint( "storage_limit_bytes", { mode: "number" } )
            .default( DEFAULT_PROVIDER_LIMIT_BYTES )
            .notNull(),
        isActive: boolean( "is_active" ).default( true ).notNull(),
        createdAt: timestamp( "created_at" ).defaultNow().notNull(),
        updatedAt: timestamp( "updated_at" )
            .defaultNow()
            .$onUpdate( () => /* @__PURE__ */ new Date() )
            .notNull(),
    },
    ( table ) => [
        index( "storageProvider_isActive_idx" ).on( table.isActive ),
    ],
)
