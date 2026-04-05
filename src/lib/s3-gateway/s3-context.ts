import { createHash, createHmac } from "node:crypto"
import { db } from "@/db"
import { virtualBucket } from "@/db/schema/s3-gateway"
import { and, eq } from "drizzle-orm"

export type BucketContext = {
    userId: string
    bucketId: string
    bucketName: string
    mappedFolderId: string | null
    createdAt: Date
}

type BucketRow = {
    userId: string
    id: string
    name: string
    mappedFolderId: string | null
    createdAt: Date
}

const SKEW_WINDOW_MS = 5 * 60 * 1000

function hmacHex( key: string | Buffer, value: string ): string {
    return createHmac( "sha256", key ).update( value ).digest( "hex" )
}

function hmac( key: string | Buffer, value: string ): Buffer {
    return createHmac( "sha256", key ).update( value ).digest()
}

function sha256Hex( value: string ): string {
    return createHash( "sha256" ).update( value ).digest( "hex" )
}

function parseAmzDate( value: string ): Date | null {
    const match = value.match( /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/ )
    if ( !match ) {
        return null
    }
    const [, year, month, day, hour, minute, second] = match
    return new Date( Date.UTC( Number( year ), Number( month ) - 1, Number( day ), Number( hour ), Number( minute ), Number( second ) ) )
}

function encodeRfc3986( value: string ): string {
    return encodeURIComponent( value )
        .replaceAll( "!", "%21" )
        .replaceAll( "'", "%27" )
        .replaceAll( "(", "%28" )
        .replaceAll( ")", "%29" )
        .replaceAll( "*", "%2A" )
}

function canonicalQueryString( url: URL, includeSignature: boolean ): string {
    const pairs: Array<{ key: string, value: string }> = []
    for ( const [key, value] of url.searchParams.entries() ) {
        if ( !includeSignature && key === "X-Amz-Signature" ) {
            continue
        }
        pairs.push( { key, value } )
    }
    pairs.sort( ( a, b ) => {
        const k = a.key.localeCompare( b.key )
        if ( k !== 0 ) return k
        return a.value.localeCompare( b.value )
    } )
    return pairs.map( ( pair ) => `${encodeRfc3986( pair.key )}=${encodeRfc3986( pair.value )}` ).join( "&" )
}

function normalizeHeaderValue( value: string ): string {
    return value.trim().replace( /\s+/g, " " )
}

function canonicalHeaders( request: Request, signedHeaders: string[] ): { headers: string, signedHeaders: string } {
    const lowered = signedHeaders.map( ( header ) => header.trim().toLowerCase() ).filter( ( header ) => header.length > 0 )
    const unique = Array.from( new Set( lowered ) ).sort()
    const parts = unique.map( ( name ) => `${name}:${normalizeHeaderValue( request.headers.get( name ) ?? "" )}` )
    return {
        headers: `${parts.join( "\n" )}\n`,
        signedHeaders: unique.join( ";" ),
    }
}

function deriveSigningKey( secretAccessKey: string, dateStamp: string, region: string, service: string ): Buffer {
    const kDate = hmac( `AWS4${secretAccessKey}`, dateStamp )
    const kRegion = hmac( kDate, region )
    const kService = hmac( kRegion, service )
    return hmac( kService, "aws4_request" )
}

function canonicalUri( url: URL ): string {
    return url.pathname
        .split( "/" )
        .map( ( segment ) => encodeRfc3986( decodeURIComponent( segment ) ) )
        .join( "/" )
}

function isWithinSkew( requestDate: Date ): boolean {
    const now = Date.now()
    return Math.abs( now - requestDate.getTime() ) <= SKEW_WINDOW_MS
}

function signingSecret(): string {
    const secret = process.env.S3_GATEWAY_CREDENTIAL_SECRET ?? process.env.BETTER_AUTH_SECRET
    if ( !secret ) {
        throw new Error( "Missing credential signing secret" )
    }
    return secret
}

function accessKeyForBucket( bucketId: string ): string {
    return `sp_${bucketId.replaceAll( "-", "" ).slice( 0, 20 )}`
}

export function accessKeyIdForBucket( bucketId: string ): string {
    return accessKeyForBucket( bucketId )
}

export function canonicalIdForUser( userId: string ): string {
    return createHash( "sha256" ).update( userId ).digest( "hex" )
}

function secretForBucket( userId: string, bucketId: string, bucketName: string ): string {
    const digest = createHmac( "sha256", signingSecret() )
        .update( `${userId}:${bucketId}:${bucketName}` )
        .digest( "hex" )
    return `${digest}${digest.slice( 0, 24 )}`
}

function toContext( row: BucketRow ): BucketContext {
    return {
        userId: row.userId,
        bucketId: row.id,
        bucketName: row.name,
        mappedFolderId: row.mappedFolderId,
        createdAt: row.createdAt,
    }
}

export async function resolveBucketByName( bucketName: string ): Promise<BucketContext | null> {
    const rows = await db
        .select( {
            userId: virtualBucket.userId,
            id: virtualBucket.id,
            name: virtualBucket.name,
            mappedFolderId: virtualBucket.mappedFolderId,
            createdAt: virtualBucket.createdAt,
        } )
        .from( virtualBucket )
        .where( and( eq( virtualBucket.name, bucketName ), eq( virtualBucket.isActive, true ) ) )
        .limit( 1 )

    return rows[0] ? toContext( rows[0] ) : null
}

export async function resolveBucketByAccessKey( accessKeyId: string ): Promise<BucketContext | null> {
    const rows = await db
        .select( {
            userId: virtualBucket.userId,
            id: virtualBucket.id,
            name: virtualBucket.name,
            mappedFolderId: virtualBucket.mappedFolderId,
            createdAt: virtualBucket.createdAt,
        } )
        .from( virtualBucket )
        .where( eq( virtualBucket.isActive, true ) )

    const matched = rows.find( ( row ) => accessKeyForBucket( row.id ) === accessKeyId )
    return matched ? toContext( matched ) : null
}

export function parseAccessKeyId( request: Request ): string | null {
    const authorization = request.headers.get( "authorization" )
    if ( authorization ) {
        const credentialMatch = authorization.match( /Credential=([^,\s]+)/ )
        const credential = credentialMatch?.[1]
        const accessKey = credential?.split( "/" )[0]
        if ( accessKey ) {
            return accessKey
        }
    }

    const url = new URL( request.url )
    const queryCredential = url.searchParams.get( "X-Amz-Credential" )
    if ( queryCredential ) {
        return queryCredential.split( "/" )[0] ?? null
    }

    return null
}

export function isSecretValid( bucket: BucketContext, secret: string ): boolean {
    return secretForBucket( bucket.userId, bucket.bucketId, bucket.bucketName ) === secret
}

export function isSigV4Valid( request: Request, bucket: BucketContext ): boolean {
    const url = new URL( request.url )
    const authorization = request.headers.get( "authorization" )
    const querySignature = url.searchParams.get( "X-Amz-Signature" )
    const secretAccessKey = secretForBucket( bucket.userId, bucket.bucketId, bucket.bucketName )

    if ( authorization ) {
        const credentialMatch = authorization.match( /Credential=([^,\s]+)/ )
        const signedHeadersMatch = authorization.match( /SignedHeaders=([^,\s]+)/ )
        const signatureMatch = authorization.match( /Signature=([a-fA-F0-9]+)/ )
        if ( !credentialMatch || !signedHeadersMatch || !signatureMatch ) {
            return false
        }

        const credential = credentialMatch[1]
        const scopeParts = credential.split( "/" )
        if ( scopeParts.length < 5 ) {
            return false
        }
        const [accessKeyId, dateStamp, region, service] = scopeParts
        if ( accessKeyId !== parseAccessKeyId( request ) ) {
            return false
        }

        const amzDate = request.headers.get( "x-amz-date" )
        if ( !amzDate ) {
            return false
        }
        const parsedDate = parseAmzDate( amzDate )
        if ( !parsedDate || !isWithinSkew( parsedDate ) ) {
            return false
        }

        const payloadHash = request.headers.get( "x-amz-content-sha256" ) ?? "UNSIGNED-PAYLOAD"
        const signedHeaders = signedHeadersMatch[1].split( ";" )
        const canonical = canonicalHeaders( request, signedHeaders )
        const canonicalRequest = [
            request.method,
            canonicalUri( url ),
            canonicalQueryString( url, true ),
            canonical.headers,
            canonical.signedHeaders,
            payloadHash,
        ].join( "\n" )

        const stringToSign = [
            "AWS4-HMAC-SHA256",
            amzDate,
            `${dateStamp}/${region}/${service}/aws4_request`,
            sha256Hex( canonicalRequest ),
        ].join( "\n" )

        const signingKey = deriveSigningKey( secretAccessKey, dateStamp, region, service )
        const expectedSignature = hmacHex( signingKey, stringToSign )
        return expectedSignature.toLowerCase() === signatureMatch[1].toLowerCase()
    }

    if ( querySignature ) {
        const algorithm = url.searchParams.get( "X-Amz-Algorithm" )
        const credential = url.searchParams.get( "X-Amz-Credential" )
        const amzDate = url.searchParams.get( "X-Amz-Date" )
        const expires = url.searchParams.get( "X-Amz-Expires" )
        const signedHeadersRaw = url.searchParams.get( "X-Amz-SignedHeaders" )
        if ( algorithm !== "AWS4-HMAC-SHA256" || !credential || !amzDate || !expires || !signedHeadersRaw ) {
            return false
        }

        const scopeParts = credential.split( "/" )
        if ( scopeParts.length < 5 ) {
            return false
        }
        const [accessKeyId, dateStamp, region, service] = scopeParts
        if ( accessKeyId !== parseAccessKeyId( request ) ) {
            return false
        }

        const expiresSeconds = Number.parseInt( expires, 10 )
        if ( !Number.isFinite( expiresSeconds ) || expiresSeconds < 1 || expiresSeconds > 604800 ) {
            return false
        }

        const parsedDate = parseAmzDate( amzDate )
        if ( !parsedDate ) {
            return false
        }
        const now = Date.now()
        const start = parsedDate.getTime() - SKEW_WINDOW_MS
        const end = parsedDate.getTime() + ( expiresSeconds * 1000 )
        if ( now < start || now > end ) {
            return false
        }

        const canonical = canonicalHeaders( request, signedHeadersRaw.split( ";" ) )
        const canonicalRequest = [
            request.method,
            canonicalUri( url ),
            canonicalQueryString( url, false ),
            canonical.headers,
            canonical.signedHeaders,
            "UNSIGNED-PAYLOAD",
        ].join( "\n" )

        const stringToSign = [
            "AWS4-HMAC-SHA256",
            amzDate,
            `${dateStamp}/${region}/${service}/aws4_request`,
            sha256Hex( canonicalRequest ),
        ].join( "\n" )

        const signingKey = deriveSigningKey( secretAccessKey, dateStamp, region, service )
        const expectedSignature = hmacHex( signingKey, stringToSign )
        return expectedSignature.toLowerCase() === querySignature.toLowerCase()
    }

    return false
}
