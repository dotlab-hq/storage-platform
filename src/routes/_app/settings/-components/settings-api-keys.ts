'use server'

import { createServerFn } from '@tanstack/react-start'
import { and, eq } from 'drizzle-orm'
import { apiAuthMiddleware } from '@/middlewares/api-auth'
import { db } from '@/db'
import { apikey } from '@/db/schema/auth-schema'
import {
    ApiKeySchema,
    DeleteKeySchema,
    UpdateApiKeySchema,
    bytesToBase64Url,
} from './settings-utils'

export const createChatApiKeyFn = createServerFn( { method: 'POST' } )
    .middleware( [apiAuthMiddleware] )
    .inputValidator( ApiKeySchema )
    .handler( async ( { data, context } ) => {
        const currentUser = context.user

        const randomBytes = crypto.getRandomValues( new Uint8Array( 32 ) )
        const tokenBody = bytesToBase64Url( randomBytes )
        const token = `sp_chat_${tokenBody}`
        const now = new Date()

        await db.insert( apikey ).values( {
            id: crypto.randomUUID(),
            name: data.name,
            start: token.slice( 0, 8 ),
            prefix: 'sp_chat',
            key: token,
            userId: currentUser.id,
            enabled: true,
            rateLimitEnabled: true,
            rateLimitTimeWindow: 60_000,
            rateLimitMax: 120,
            requestCount: 0,
            remaining: 120,
            permissions: JSON.stringify( data.scopes ),
            metadata: JSON.stringify( { usage: 'chat-completions' } ),
            createdAt: now,
            updatedAt: now,
        } )

        return {
            success: true,
            apiKey: {
                key: token,
            },
        }
    } )

export const deleteChatApiKeyFn = createServerFn( { method: 'POST' } )
    .middleware( [apiAuthMiddleware] )
    .inputValidator( DeleteKeySchema )
    .handler( async ( { data, context } ) => {
        const currentUser = context.user

        const result = await db
            .delete( apikey )
            .where( and( eq( apikey.id, data.id ), eq( apikey.userId, currentUser.id ) ) )
            .returning()

        if ( result.length === 0 ) {
            throw new Error( 'API Key not found or unauthorized' )
        }

        return { success: true }
    } )

export const updateChatApiKeyFn = createServerFn( { method: 'POST' } )
    .middleware( [apiAuthMiddleware] )
    .inputValidator( UpdateApiKeySchema )
    .handler( async ( { data, context } ) => {
        const currentUser = context.user

        const updateValues: Partial<typeof apikey.$inferInsert> = {
            updatedAt: new Date(),
        }
        if ( data.name !== undefined ) {
            updateValues.name = data.name.trim()
        }
        if ( data.scopes !== undefined ) {
            updateValues.permissions = JSON.stringify( data.scopes )
        }

        const result = await db
            .update( apikey )
            .set( updateValues )
            .where( and( eq( apikey.id, data.id ), eq( apikey.userId, currentUser.id ) ) )
            .returning()

        if ( result.length === 0 ) {
            throw new Error( 'API Key not found or unauthorized' )
        }

        let scopes: string[] = []
        if ( result[0].permissions ) {
            try {
                scopes = JSON.parse( result[0].permissions )
            } catch {
                scopes = []
            }
        }

        return {
            success: true,
            apiKey: {
                id: result[0].id,
                name: result[0].name,
                scopes,
            },
        }
    } )