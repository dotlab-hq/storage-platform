import { db } from "@/db"
import { file } from "@/db/schema/storage"
import { storageProvider } from "@/db/schema/storage-provider"
import { encryptProviderSecret } from "@/lib/provider-crypto"
import { getStorageAdminSummary, getUsersWithUsage, listProvidersWithUsage } from "@/lib/storage-provider-queries"
import { requireAdminUser } from "@/lib/server-auth"
import { createServerFn } from "@tanstack/react-start"
import { and, count, eq } from "drizzle-orm"
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

const ProviderIdSchema = z.object( {
    providerId: z.string().min( 1 ),
} )

const UpdateProviderAvailabilitySchema = z.object( {
    providerId: z.string().min( 1 ),
    isActive: z.boolean(),
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

export const setStorageProviderAvailabilityFn = createServerFn( { method: "POST" } )
    .inputValidator( UpdateProviderAvailabilitySchema )
    .handler( async ( { data } ) => {
        await requireAdminUser()
        const [provider] = await db
            .update( storageProvider )
            .set( { isActive: data.isActive } )
            .where( eq( storageProvider.id, data.providerId ) )
            .returning( {
                id: storageProvider.id,
                isActive: storageProvider.isActive,
            } )
        if ( !provider ) {
            throw new Error( "Storage provider not found" )
        }
        return { success: true, provider }
    } )

export const deleteStorageProviderFn = createServerFn( { method: "POST" } )
    .inputValidator( ProviderIdSchema )
    .handler( async ( { data } ) => {
        await requireAdminUser()
        const [inUseRow] = await db
            .select( { count: count() } )
            .from( file )
            .where(
                and(
                    eq( file.providerId, data.providerId ),
                    eq( file.isDeleted, false ),
                ),
            )
        if ( inUseRow.count > 0 ) {
            throw new Error( "Storage provider cannot be deleted while files are still stored in it" )
        }
        const deleted = await db
            .delete( storageProvider )
            .where( eq( storageProvider.id, data.providerId ) )
            .returning( { id: storageProvider.id } )
        if ( deleted.length === 0 ) {
            throw new Error( "Storage provider not found" )
        }
        return { success: true }
    } )
