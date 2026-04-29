import { env } from 'cloudflare:workers'

export class Cache {
  /** Retrieve a value from KV cache. Errors (including quota limits) are logged and ignored. */
  static async get<T = string>( key: string ): Promise<T | null> {
    try {
      return ( await env.KV.get( key, 'json' ) ) as T | null
    } catch ( e ) {
      console.error( '[Cache] get error for key', key, e )
      return null
    }
  }

  /** Store a value in KV cache. Errors are logged and ignored to keep operation silent. */
  static async set<T>(
    key: string,
    value: T,
    options?: { expirationTtl?: number },
  ): Promise<void> {
    try {
      await env.KV.put( key, JSON.stringify( value ), options )
    } catch ( e ) {
      console.error( '[Cache] set error for key', key, e )
      // swallow error
    }
  }

  /** Delete a key from KV cache. Errors (e.g., daily limit exceeded) are logged but not thrown. */
  static async delete( key: string ): Promise<void> {
    try {
      await env.KV.delete( key )
    } catch ( e ) {
      console.error( '[Cache] delete error for key', key, e )
      // swallow error
    }
  }
}
