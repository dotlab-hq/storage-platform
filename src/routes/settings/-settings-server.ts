import { auth } from "@/lib/auth"
import { getAuthenticatedUser } from "@/lib/server-auth"
import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"
import { z } from "zod"

const ProfileSchema = z.object( {
  name: z.string().trim().min( 1 ).max( 120 ),
  image: z.string().trim().url().or( z.literal( "" ) ).optional(),
} )

const PasswordSchema = z.object( {
  currentPassword: z.string().min( 8 ),
  newPassword: z.string().min( 8 ),
} )

const TwoFactorPasswordSchema = z.object( {
  password: z.string().min( 8 ),
} )

const VerifyTotpSchema = z.object( {
  code: z.string().trim().regex( /^\d{6}$/ ),
} )

type AuthAccountMethod = {
  id: string
  providerId: string
  accountId: string
  createdAt: Date
}

const toErrorMessage = ( error: unknown, fallback: string ): string => {
  if ( error instanceof Error && error.message ) return error.message
  return fallback
}

export const getSettingsSnapshotFn = createServerFn( { method: "GET" } ).handler( async () => {
  const currentUser = await getAuthenticatedUser()
  const request = getRequest()
  const headers = request.headers
  const [session, methods] = await Promise.all( [
    auth.api.getSession( { headers } ),
    auth.api.listUserAccounts( { headers } ).catch( () => [] as AuthAccountMethod[] ),
  ] )
  if ( !session?.user ) throw new Error( "Unauthorized" )
  const twoFactorEnabled = Boolean( ( session.user as { twoFactorEnabled?: boolean } ).twoFactorEnabled )
  return {
    user: {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      image: session.user.image ?? "",
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
  }
} )

export const updateProfileSettingsFn = createServerFn( { method: "POST" } )
  .inputValidator( ProfileSchema )
  .handler( async ( { data } ) => {
    await getAuthenticatedUser()
    const request = getRequest()
    const headers = request.headers
    try {
      await auth.api.updateUser( {
        headers,
        body: {
          name: data.name,
          image: data.image?.trim() ? data.image.trim() : null,
        },
      } )
      return { success: true, message: "Profile updated." }
    } catch ( error ) {
      throw new Error( toErrorMessage( error, "Failed to update profile." ) )
    }
  } )

export const changePasswordSettingsFn = createServerFn( { method: "POST" } )
  .inputValidator( PasswordSchema )
  .handler( async ( { data } ) => {
    await getAuthenticatedUser()
    const request = getRequest()
    const headers = request.headers
    try {
      await auth.api.changePassword( { headers, body: { ...data, revokeOtherSessions: true } } )
      return { success: true, message: "Password changed." }
    } catch ( error ) {
      throw new Error( toErrorMessage( error, "Failed to change password." ) )
    }
  } )

export const enableTwoFactorSettingsFn = createServerFn( { method: "POST" } )
  .inputValidator( TwoFactorPasswordSchema )
  .handler( async ( { data } ) => {
    await getAuthenticatedUser()
    const request = getRequest()
    const headers = request.headers
    try {
      return await auth.api.enableTwoFactor( {
        headers,
        body: {
          password: data.password,
          issuer: "DOT Storage Platform",
        },
      } )
    } catch ( error ) {
      throw new Error( toErrorMessage( error, "Failed to enable 2FA." ) )
    }
  } )

export const verifyTwoFactorSettingsFn = createServerFn( { method: "POST" } )
  .inputValidator( VerifyTotpSchema )
  .handler( async ( { data } ) => {
    await getAuthenticatedUser()
    const request = getRequest()
    const headers = request.headers
    try {
      await auth.api.verifyTOTP( { headers, body: { code: data.code } } )
      return { success: true, message: "2FA verified and enabled." }
    } catch ( error ) {
      throw new Error( toErrorMessage( error, "Failed to verify 2FA code." ) )
    }
  } )

export const disableTwoFactorSettingsFn = createServerFn( { method: "POST" } )
  .inputValidator( TwoFactorPasswordSchema )
  .handler( async ( { data } ) => {
    await getAuthenticatedUser()
    const request = getRequest()
    const headers = request.headers
    try {
      await auth.api.disableTwoFactor( { headers, body: { password: data.password } } )
      return { success: true, message: "2FA disabled." }
    } catch ( error ) {
      throw new Error( toErrorMessage( error, "Failed to disable 2FA." ) )
    }
  } )

export const rotateBackupCodesSettingsFn = createServerFn( { method: "POST" } )
  .inputValidator( TwoFactorPasswordSchema )
  .handler( async ( { data } ) => {
    await getAuthenticatedUser()
    const request = getRequest()
    const headers = request.headers
    try {
      return await auth.api.generateBackupCodes( { headers, body: { password: data.password } } )
    } catch ( error ) {
      throw new Error( toErrorMessage( error, "Failed to rotate backup codes." ) )
    }
  } )
