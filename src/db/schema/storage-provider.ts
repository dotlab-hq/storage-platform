import { integer, index, text } from "drizzle-orm/sqlite-core"
import { schema } from "./schema"
import { UNDETERMINED_PROVIDER_VALUE } from "@/lib/storage-provider-constants"

const DEFAULT_PROVIDER_LIMIT_BYTES = 50 * 1024 * 1024 * 1024
const DEFAULT_PROVIDER_FILE_SIZE_LIMIT_BYTES = DEFAULT_PROVIDER_LIMIT_BYTES

export const storageProvider = schema.table(
    "storage_provider",
    {
        id: text( "id" )
            .$defaultFn( () => crypto.randomUUID() )
            .primaryKey(),
        name: text( "name" ).notNull().unique(),
        // "undetermined" means this value can be supplied from environment configuration at runtime.
        endpoint: text( "endpoint" ).default( UNDETERMINED_PROVIDER_VALUE ).notNull(),
        region: text( "region" ).default( UNDETERMINED_PROVIDER_VALUE ).notNull(),
        bucketName: text( "bucket_name" ).default( UNDETERMINED_PROVIDER_VALUE ).notNull(),
        accessKeyIdEncrypted: text( "access_key_id_encrypted" ).default( UNDETERMINED_PROVIDER_VALUE ).notNull(),
        secretAccessKeyEncrypted: text( "secret_access_key_encrypted" ).default( UNDETERMINED_PROVIDER_VALUE ).notNull(),
        storageLimitBytes: integer( "storage_limit_bytes", { mode: "number" } )
            .default( DEFAULT_PROVIDER_LIMIT_BYTES )
            .notNull(),
        fileSizeLimitBytes: integer( "file_size_limit_bytes", { mode: "number" } )
            .default( DEFAULT_PROVIDER_FILE_SIZE_LIMIT_BYTES )
            .notNull(),
        isActive: integer( "is_active", { mode: "boolean" } ).default( true ).notNull(),
        createdAt: integer( "created_at", { mode: "timestamp" } ).$defaultFn( () => new Date() ).notNull(),
        updatedAt: integer( "updated_at", { mode: "timestamp" } )
            .$defaultFn( () => new Date() )
            .$onUpdate( () => /* @__PURE__ */ new Date() )
            .notNull(),
    },
    ( table ) => [
        index( "storageProvider_isActive_idx" ).on( table.isActive ),
    ],
)
