type AuthModule = typeof import( '@/lib/auth' )

export async function loadAuth(): Promise<AuthModule['auth']> {
    const module = await import( '@/lib/auth' )
    return module.auth
}
