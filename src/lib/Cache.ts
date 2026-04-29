import { env } from 'cloudflare:workers'

export class Cache {
  static get<T = string>( key: string ): Promise<T | null> {
    // Silently handle cache unavailability or errors
    try {
      return env.KV.get( key, 'json' )
    } catch ( e ) {
      // Log for debugging but do not propagate error
      console.error( '[Cache] get error for key', key, e )
      return Promise.resolve( null )
    }
  }
  static set<T>(
    key: string,
    value: T,
    options?: { expirationTtl?: number },
  ): Promise<void> {
    try {
      return env.KV.put( key, JSON.stringify( value ), options )
    } catch ( e ) {
      console.error( '[Cache] set error for key', key, e )
      // Swallow error to allow operation to continue
      return Promise.resolve()
    }
  }
  static delete( key: string ): Promise<void> {
    try {
      return env.KV.delete( key )
    } catch ( e ) {
      console.error( '[Cache] delete error for key', key, e )
      return Promise.resolve()
    }
  }
}
