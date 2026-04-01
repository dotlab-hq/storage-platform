import { auth } from "@/lib/auth"
import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"
import { z } from "zod"

const LoginSchema = z.object( {
  email: z.string().email( "Enter a valid email." ),
  password: z.string().min( 1, "Password is required." ),
} )

const SignupSchema = z.object( {
  name: z.string().trim().min( 1, "Name is required." ).max( 120 ),
  email: z.string().email( "Enter a valid email." ),
  password: z.string().min( 8, "Password must be at least 8 characters." ),
} )

const ForgotPasswordSchema = z.object( {
  email: z.string().email( "Enter a valid email." ),
} )

const ResetPasswordSchema = z.object( {
  token: z.string().trim().min( 1, "Reset token is required." ),
  newPassword: z.string().min( 8, "Password must be at least 8 characters." ),
} )

const toAuthErrorMessage = ( error: unknown, fallback: string ): string => {
  if ( error instanceof Error && error.message ) {
    if ( /at least 8|minPasswordLength|password length/i.test( error.message ) ) {
      return "Password must be at least 8 characters."
    }
    return error.message
  }
  return fallback
}

export const loginWithPasswordFn = createServerFn( { method: "POST" } )
  .inputValidator( LoginSchema )
  .handler( async ( { data } ) => {
    try {
      await auth.api.signInEmail( {
        body: {
          email: data.email,
          password: data.password,
          rememberMe: true,
        },
      } )
      return { success: true, message: "Logged in successfully." }
    } catch ( error ) {
      throw new Error( toAuthErrorMessage( error, "Failed to log in." ) )
    }
  } )

export const signupWithPasswordFn = createServerFn( { method: "POST" } )
  .inputValidator( SignupSchema )
  .handler( async ( { data } ) => {
    try {
      await auth.api.signUpEmail( {
        body: {
          name: data.name,
          email: data.email,
          password: data.password,
        },
      } )
      return { success: true, message: "Account created successfully." }
    } catch ( error ) {
      throw new Error( toAuthErrorMessage( error, "Failed to create account." ) )
    }
  } )

export const requestPasswordResetFn = createServerFn( { method: "POST" } )
  .inputValidator( ForgotPasswordSchema )
  .handler( async ( { data } ) => {
    try {
      await auth.api.requestPasswordReset( {
        body: {
          email: data.email,
          redirectTo: "/auth/reset-password",
        },
      } )
      return { success: true, message: "If that email exists, a reset link was sent." }
    } catch ( error ) {
      throw new Error( toAuthErrorMessage( error, "Failed to request password reset." ) )
    }
  } )

export const resetPasswordFn = createServerFn( { method: "POST" } )
  .inputValidator( ResetPasswordSchema )
  .handler( async ( { data } ) => {
    const request = getRequest()
    try {
      await auth.api.resetPassword( {
        headers: request.headers,
        body: {
          token: data.token,
          newPassword: data.newPassword,
        },
      } )
      return { success: true, message: "Password has been reset." }
    } catch ( error ) {
      throw new Error( toAuthErrorMessage( error, "Failed to reset password." ) )
    }
  } )
