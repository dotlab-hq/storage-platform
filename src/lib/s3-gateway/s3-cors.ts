import type { BucketContext } from '@/lib/s3-gateway/s3-context'
import { getBucketCors } from '@/lib/s3-gateway/s3-bucket-controls'

function includesCaseInsensitive( values: string[], expected: string ): boolean {
  return values.some( ( value ) => value.toLowerCase() === expected.toLowerCase() )
}

function originMatches( allowedOrigins: string[], origin: string ): boolean {
  if ( allowedOrigins.includes( '*' ) ) return true
  return includesCaseInsensitive( allowedOrigins, origin )
}

function headersMatch(
  allowedHeaders: string[],
  requestedHeaders: string[],
): boolean {
  if ( allowedHeaders.length === 0 || allowedHeaders.includes( '*' ) ) return true
  return requestedHeaders.every( ( header ) =>
    includesCaseInsensitive( allowedHeaders, header ),
  )
}

export async function applyBucketCors(
  request: Request,
  response: Response,
  bucket: BucketContext | null,
): Promise<Response> {
  const origin = request.headers.get( 'origin' )
  if ( !origin || !bucket ) {
    return response
  }

  const rules = await getBucketCors( bucket.bucketId )
  if ( rules.length === 0 ) {
    return response
  }

  const method =
    request.method === 'OPTIONS'
      ? ( request.headers.get( 'access-control-request-method' ) ?? '' )
      : request.method
  const requestedHeaders = (
    request.headers.get( 'access-control-request-headers' ) ?? ''
  )
    .split( ',' )
    .map( ( item ) => item.trim() )
    .filter( ( item ) => item.length > 0 )

  const matched = rules.find( ( rule ) => {
    return (
      originMatches( rule.allowedOrigins, origin ) &&
      includesCaseInsensitive( rule.allowedMethods, method ) &&
      headersMatch( rule.allowedHeaders, requestedHeaders )
    )
  } )

  if ( !matched ) {
    return response
  }

  const headers = new Headers( response.headers )
  headers.set( 'access-control-allow-origin', origin )
  headers.set( 'access-control-allow-methods', matched.allowedMethods.join( ',' ) )
  headers.set( 'access-control-allow-headers', matched.allowedHeaders.join( ',' ) )
  headers.set( 'access-control-expose-headers', matched.exposeHeaders.join( ',' ) )
  headers.set( 'access-control-max-age', String( matched.maxAgeSeconds ?? 300 ) )
  headers.set(
    'Vary',
    'Origin, Access-Control-Request-Headers, Access-Control-Request-Method',
  )

  const normalizedStatus =
    response.status >= 200 && response.status <= 599 ? response.status : 500

  return new Response( response.body, {
    status: normalizedStatus,
    statusText: response.statusText,
    headers,
  } )
}
