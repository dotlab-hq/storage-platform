'use server'

import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { apiAuthMiddleware } from '@/middlewares/api-auth'
import { auth } from '@/lib/auth'
import {
    PasswordSchema,
    ProfileSchema,
    TwoFactorPasswordSchema,
    VerifyTotpSchema,
    hasPasswordCredential,
    toErrorMessage,
} from './settings-utils'

export const updateProfileSettingsFn = createServerFn( { method: 'POST' } )
    .middleware( [apiAuthMiddleware] )
    .inputValidator( ProfileSchema )
    .handler( async ( { data } ) => {
        const request = getRequest()
        const headers = request.headers
        try {
            await auth.api.updateUser( {
                headers,
                body: {
                    name: data.name,
                    image: data.image.trim() ? data.image.trim() : null,
                },
            } )
            return { success: true, message: 'Profile updated.' }
        } catch ( error ) {
            throw new Error( toErrorMessage( error, 'Failed to update profile.' ) )
        }
    } )

export const changePasswordSettingsFn = createServerFn( { method: 'POST' } )
    .middleware( [apiAuthMiddleware] )
    .inputValidator( PasswordSchema )
    .handler( async ( { data, context } ) => {
        const currentUser = context.user
        const request = getRequest()
        const headers = request.headers
        try {
            const hasPassword = await hasPasswordCredential( currentUser.id )
            if ( hasPassword ) {
                if ( !data.currentPassword?.trim() ) {
                    throw new Error( 'Current password is required.' )
                }
                await auth.api.changePassword( {
                    headers,
                    body: {
                        currentPassword: data.currentPassword,
                        newPassword: data.newPassword,
                        revokeOtherSessions: true,
                    },
                } )
            } else {
                await auth.api.setPassword( {
                    headers,
                    body: { newPassword: data.newPassword },
                } )
            }
            return { success: true, message: 'Password updated.' }
        } catch ( error ) {
            throw new Error( toErrorMessage( error, 'Failed to update password.' ) )
        }
    } )

export const enableTwoFactorSettingsFn = createServerFn( { method: 'POST' } )
    .middleware( [apiAuthMiddleware] )
    .inputValidator( TwoFactorPasswordSchema )
    .handler( async ( { data } ) => {
        const request = getRequest()
        const headers = request.headers
        try {
            return await auth.api.enableTwoFactor( {
                headers,
                body: {
                    password: data.password,
                    issuer: 'DOT Storage Platform',
                },
            } )
        } catch ( error ) {
            throw new Error( toErrorMessage( error, 'Failed to enable 2FA.' ) )
        }
    } )

export const verifyTwoFactorSettingsFn = createServerFn( { method: 'POST' } )
    .middleware( [apiAuthMiddleware] )
    .inputValidator( VerifyTotpSchema )
    .handler( async ( { data } ) => {
        const request = getRequest()
        const headers = request.headers
        try {
            await auth.api.verifyTOTP( { headers, body: { code: data.code } } )
            return { success: true, message: '2FA verified and enabled.' }
        } catch ( error ) {
            throw new Error( toErrorMessage( error, 'Failed to verify 2FA code.' ) )
        }
    } )

export const disableTwoFactorSettingsFn = createServerFn( { method: 'POST' } )
    .middleware( [apiAuthMiddleware] )
    .inputValidator( TwoFactorPasswordSchema )
    .handler( async ( { data } ) => {
        const request = getRequest()
        const headers = request.headers
        try {
            await auth.api.disableTwoFactor( {
                headers,
                body: { password: data.password },
            } )
            return { success: true, message: '2FA disabled.' }
        } catch ( error ) {
            throw new Error( toErrorMessage( error, 'Failed to disable 2FA.' ) )
        }
    } )