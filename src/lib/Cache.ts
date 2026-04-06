import { env } from "cloudflare:workers";

export class Cache {
    static get<T = string>( key: string ): Promise<T | null> {
        return env.KV.get( key, "json" ) as Promise<T | null>
    }
    static set<T>( key: string, value: T, options?: { expirationTtl?: number} ): Promise<void> {
        return env.KV.put( key, JSON.stringify( value ),options)
    }
    static delete( key: string ): Promise<void> {
        return env.KV.delete( key )
    }

}