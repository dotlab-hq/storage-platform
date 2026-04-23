import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { z } from 'zod'
import { db } from '@/db'
import { user } from '@/db/schema/auth-schema'
import { eq } from 'drizzle-orm'
import { logActivity } from '@/lib/activity'

async function loadAuth() {
  const module = await import('@/lib/auth')
  return module.auth
}

const LoginSchema = z.object({
  email: z.string().email('Enter a valid email.'),
  password: z.string().min(1, 'Password is required.'),
})

const SignupSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(120),
  email: z.string().email('Enter a valid email.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
})

const ForgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email.'),
})

const ResetPasswordSchema = z.object({
  token: z.string().trim().min(1, 'Reset token is required.'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters.'),
})

const toAuthErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message) {
    if (/at least 8|minPasswordLength|password length/i.test(error.message)) {
      return 'Password must be at least 8 characters.'
    }
    return error.message
  }
  return fallback
}

export const loginWithPasswordFn = createServerFn({ method: 'POST' })
  .inputValidator(LoginSchema)
  .handler(async ({ data }) => {
    const request = getRequest()
    const auth = await loadAuth()
    try {
      await auth.api.signInEmail({
        headers: request.headers,
        body: {
          email: data.email,
          password: data.password,
          rememberMe: true,
        },
      })

      // Log successful login
      try {
        const [userRow] = await db
          .select({ id: user.id })
          .from(user)
          .where(eq(user.email, data.email))
          .limit(1)
        if (userRow) {
          await logActivity({
            userId: userRow.id,
            eventType: 'login',
            resourceType: 'user',
            resourceId: userRow.id,
            tags: ['Auth'],
            meta: { email: data.email },
          })
        }
      } catch (logErr) {
        console.error('[Activity] Failed to log login:', logErr)
      }

      return { success: true, message: 'Logged in successfully.' }
    } catch (error) {
      throw new Error(toAuthErrorMessage(error, 'Failed to log in.'))
    }
  })

export const signupWithPasswordFn = createServerFn({ method: 'POST' })
  .inputValidator(SignupSchema)
  .handler(async ({ data }) => {
    const request = getRequest()
    const auth = await loadAuth()
    try {
      await auth.api.signUpEmail({
        headers: request.headers,
        body: {
          name: data.name,
          email: data.email,
          password: data.password,
          isAdmin: false,
        },
      })

      // Log successful signup
      try {
        const [userRow] = await db
          .select({ id: user.id })
          .from(user)
          .where(eq(user.email, data.email))
          .limit(1)
        if (userRow) {
          await logActivity({
            userId: userRow.id,
            eventType: 'signup',
            resourceType: 'user',
            resourceId: userRow.id,
            tags: ['Auth'],
            meta: { email: data.email, name: data.name },
          })
        }
      } catch (logErr) {
        console.error('[Activity] Failed to log signup:', logErr)
      }

      return { success: true, message: 'Account created successfully.' }
    } catch (error) {
      throw new Error(toAuthErrorMessage(error, 'Failed to create account.'))
    }
  })

export const requestPasswordResetFn = createServerFn({ method: 'POST' })
  .inputValidator(ForgotPasswordSchema)
  .handler(async ({ data }) => {
    const auth = await loadAuth()
    try {
      await auth.api.requestPasswordReset({
        body: {
          email: data.email,
          redirectTo: '/auth',
        },
      })

      // Log password reset request
      try {
        const [userRow] = await db
          .select({ id: user.id })
          .from(user)
          .where(eq(user.email, data.email))
          .limit(1)
        if (userRow) {
          await logActivity({
            userId: userRow.id,
            eventType: 'password_reset_request',
            tags: ['Auth'],
            meta: { email: data.email },
          })
        }
      } catch (logErr) {
        console.error(
          '[Activity] Failed to log password reset request:',
          logErr,
        )
      }

      return {
        success: true,
        message: 'If that email exists, a reset link was sent.',
      }
    } catch (error) {
      throw new Error(
        toAuthErrorMessage(error, 'Failed to request password reset.'),
      )
    }
  })

export const resetPasswordFn = createServerFn({ method: 'POST' })
  .inputValidator(ResetPasswordSchema)
  .handler(async ({ data }) => {
    const request = getRequest()
    const auth = await loadAuth()
    try {
      await auth.api.resetPassword({
        headers: request.headers,
        body: {
          token: data.token,
          newPassword: data.newPassword,
        },
      })

      // Log password reset completion
      try {
        const session = await auth.api.getSession({ headers: request.headers })
        if (session?.user?.id) {
          await logActivity({
            userId: session.user.id,
            eventType: 'password_reset',
            tags: ['Auth'],
            meta: { success: true },
          })
        }
      } catch (logErr) {
        console.error('[Activity] Failed to log password reset:', logErr)
      }

      return { success: true, message: 'Password has been reset.' }
    } catch (error) {
      throw new Error(toAuthErrorMessage(error, 'Failed to reset password.'))
    }
  })
