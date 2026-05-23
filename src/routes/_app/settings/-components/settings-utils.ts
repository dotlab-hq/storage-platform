import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/db'
import { account, apikey, user } from '@/db/schema/auth-schema'
import { getAllScopes } from '@/lib/permissions/scopes'
import type { ApiScope } from '@/lib/permissions/scopes'

const ALL_SCOPES = getAllScopes() as readonly ApiScope[]

export const ProfileSchema = z.object( {
    name: z.string().trim().min( 1 ).max( 120 ),
    image: z.string().trim().url().or( z.literal( '' ) ),
} )

export const PasswordSchema = z.object( {
    currentPassword: z.string().optional(),
    newPassword: z.string().min( 8, 'Password must be at least 8 characters.' ),
} )

export const TwoFactorPasswordSchema = z.object( {
    password: z.string().min( 8 ),
} )

export const VerifyTotpSchema = z.object( {
    code: z.string().length( 6, 'TOTP code must be 6 digits' ),
} )

export const ApiKeySchema = z.object( {
    name: z.string().trim().min( 1 ).max( 60 ),
    scopes: z
        .array( z.enum( ALL_SCOPES ) )
        .min( 1, 'At least one scope must be selected' )
        .max( 20, 'Maximum 20 scopes allowed' ),
} )

export const UpdateApiKeySchema = z.object( {
    id: z.string(),
    name: z.string().trim().min( 1 ).max( 60 ).optional(),
    scopes: z
        .array( z.enum( ALL_SCOPES ) )
        .min( 1, 'At least one scope must be selected' )
        .max( 20, 'Maximum 20 scopes allowed' )
        .optional(),
} )

export const DeleteKeySchema = z.object( {
    id: z.string(),
} )

export const bytesToBase64Url = ( bytes: Uint8Array ): string => {
    const base64 = Buffer.from( bytes ).toString( 'base64' )
    return base64.replace( /\+/g, '-' ).replace( /\//g, '_' ).replace( /=+$/g, '' )
}

export const toErrorMessage = (
    error: unknown,
    fallback: string,
): string => {
    if ( error instanceof Error && error.message ) {
        if ( /at least 8|minPasswordLength|password length/i.test( error.message ) ) {
            return 'Password must be at least 8 characters.'
        }
        return error.message
    }
    return fallback
}

export const hasPasswordCredential = async (
    userId: string,
): Promise<boolean> => {
    const credentialAccount = await db.query.account.findFirst( {
        columns: { password: true },
        where: and(
            eq( account.userId, userId ),
            eq( account.providerId, 'credential' ),
        ),
    } )
    return Boolean( credentialAccount?.password )
}

export const hasChatScope = ( permissions: string | null ): boolean => {
    if ( !permissions ) {
        return false
    }

    try {
        const parsed = JSON.parse( permissions ) as unknown
        if ( !Array.isArray( parsed ) ) {
            return false
        }

        return parsed.some(
            ( value ): value is string =>
                typeof value === 'string' && value === 'chat:completions',
        )
    } catch {
        return false
    }
}

export type { ApiScope }