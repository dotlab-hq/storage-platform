'use server'

import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { and, desc, eq, gt } from 'drizzle-orm'
import { apiAuthMiddleware } from '@/middlewares/api-auth'
import { auth } from '@/lib/auth'
import { db } from '@/db'
import { account, apikey, session as authSession, user } from '@/db/schema/auth-schema'
import { listUserProvidersWithUsage } from '@/lib/storage-provider-queries'
import { hasChatScope } from './settings-utils'

type AuthAccountMethod = {
    id: string
    providerId: string
    accountId: string
    createdAt: Date
}

type SessionSnapshot = {
    id: string
    expiresAt: Date
    createdAt: Date
    ipAddress: string | null
    userAgent: string | null
}

type SessionUserWith2FA = {
    image?: string | null
    twoFactorEnabled?: boolean
}

export const getSettingsSnapshotFn = createServerFn( { method: 'GET' } )
    .middleware( [apiAuthMiddleware] )
    .handler( async ( { context } ) => {
        const currentUser = context.user
        const request = getRequest()
        const headers = request.headers
        const now = new Date()

        const [session, methods, apiKeys, activeSessions, recentSessions] =
            await Promise.all( [
                auth.api.getSession( { headers } ),
                auth.api.listUserAccounts( { headers } ).catch( ( error: unknown ) => {
                    console.error( '[settings] listUserAccounts failed', error )
                    return [] as AuthAccountMethod[]
                } ),
                db.query.apikey.findMany( {
                    where: eq( apikey.userId, currentUser.id ),
                    orderBy: ( apiKeyRow, { desc } ) => [desc( apiKeyRow.createdAt )],
                } ),
                db
                    .select( {
                        id: authSession.id,
                        expiresAt: authSession.expiresAt,
                        createdAt: authSession.createdAt,
                        ipAddress: authSession.ipAddress,
                        userAgent: authSession.userAgent,
                    } )
                    .from( authSession )
                    .where(
                        and(
                            eq( authSession.userId, currentUser.id ),
                            gt( authSession.expiresAt, now ),
                        ),
                    )
                    .orderBy( desc( authSession.updatedAt ) )
                    .limit( 8 ),
                db
                    .select( {
                        id: authSession.id,
                        expiresAt: authSession.expiresAt,
                        createdAt: authSession.createdAt,
                        ipAddress: authSession.ipAddress,
                        userAgent: authSession.userAgent,
                    } )
                    .from( authSession )
                    .where( eq( authSession.userId, currentUser.id ) )
                    .orderBy( desc( authSession.createdAt ) )
                    .limit( 8 ),
            ] )

        if ( !session?.user ) throw new Error( 'Unauthorized' )
        const sessionUser = session.user as SessionUserWith2FA
        const twoFactorEnabled = Boolean( sessionUser.twoFactorEnabled )

        const [userSettings] = await db
            .select( { use_system_providers: user.use_system_providers } )
            .from( user )
            .where( eq( user.id, currentUser.id ) )
            .limit( 1 )

        const use_system_providers = userSettings?.use_system_providers ?? true
        const providers = await listUserProvidersWithUsage( currentUser.id )

        return {
            user: {
                id: currentUser.id,
                name: currentUser.name,
                email: currentUser.email,
                image: session.user.image ?? '',
                role: currentUser.role,
            },
            security: {
                twoFactorEnabled,
                passkeysSupported: false,
            },
            methods: methods.map( ( method ) => ( {
                id: method.id,
                providerId: method.providerId,
                accountId: method.accountId,
                createdAt: method.createdAt,
            } ) ),
            apiKeys: apiKeys
                .filter( ( key ) => hasChatScope( key.permissions ) )
                .map( ( key ) => {
                    let scopes: string[] = []
                    if ( key.permissions ) {
                        try {
                            scopes = JSON.parse( key.permissions )
                        } catch {
                            scopes = []
                        }
                    }
                    return {
                        id: key.id,
                        name: key.name?.trim() || 'Chat API Key',
                        keyPreview: key.key.slice( 0, 8 ),
                        status: key.enabled === false ? 'revoked' : 'active',
                        scopes,
                        createdAt: key.createdAt,
                    }
                } ),
            tinySessions: {
                active: activeSessions.map( ( sessionRow ): SessionSnapshot => ( {
                    id: sessionRow.id,
                    expiresAt: sessionRow.expiresAt,
                    createdAt: sessionRow.createdAt,
                    ipAddress: sessionRow.ipAddress,
                    userAgent: sessionRow.userAgent,
                } ) ),
                recent: recentSessions.map( ( sessionRow ): SessionSnapshot => ( {
                    id: sessionRow.id,
                    expiresAt: sessionRow.expiresAt,
                    createdAt: sessionRow.createdAt,
                    ipAddress: sessionRow.ipAddress,
                    userAgent: sessionRow.userAgent,
                } ) ),
            },
            use_system_providers: use_system_providers,
            providers,
        }
    } )