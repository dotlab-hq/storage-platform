import { db } from "@/db"
import { storageProvider } from "@/db/schema/storage-provider"
import { encryptProviderSecret } from "@/lib/provider-crypto"
import { getStorageAdminSummary, getUsersWithUsage, listProvidersWithUsage } from "@/lib/storage-provider-queries"
import { requireAdminUser } from "@/lib/server-auth"
import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

const CreateProviderSchema = z.object( {
    name: z.string().min( 2 ),
    endpoint: z.string().url(),
    region: z.string().min( 2 ),
    bucketName: z.string().min( 3 ),
    accessKeyId: z.string().min( 3 ),
    secretAccessKey: z.string().min( 3 ),
    storageLimitBytes: z.number().int().positive(),
    isActive: z.boolean().default( true ),
} )

export const getAdminDashboardDataFn = createServerFn( { method: "GET" } )
    .handler( async () => {
        await requireAdminUser()
        const [summary, providers, users] = await Promise.all( [
            getStorageAdminSummary(),
            listProvidersWithUsage(),
            getUsersWithUsage(),
        ] )
        return { summary, providers, users }
    } )

export const createStorageProviderFn = createServerFn( { method: "POST" } )
    .inputValidator( CreateProviderSchema )
    .handler( async ( { data } ) => {
        await requireAdminUser()
        const [provider] = await db
            .insert( storageProvider )
            .values( {
                name: data.name,
                endpoint: data.endpoint,
                region: data.region,
                bucketName: data.bucketName,
                accessKeyIdEncrypted: encryptProviderSecret( data.accessKeyId ),
                secretAccessKeyEncrypted: encryptProviderSecret( data.secretAccessKey ),
                storageLimitBytes: data.storageLimitBytes,
                isActive: data.isActive,
            } )
            .returning( {
                id: storageProvider.id,
                name: storageProvider.name,
            } )
        return { success: true, provider }
    } )
