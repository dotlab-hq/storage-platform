import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getAuthenticatedUser } from '@/lib/server-auth'
import { getProviderClientById } from '@/lib/s3-provider-client'
import { logActivity } from '@/lib/activity'

const PROXY_DOWNLOAD_URL = '/api/storage/download/proxy'

const DownloadProxyParamsSchema = z.object( {
    objectKey: z.string().min( 1 ),
    providerId: z.string().nullable(),
} )

export const getDownloadProxyUrl = createServerFn( { method: 'POST' } )
    .inputValidator( DownloadProxyParamsSchema )
    .handler( async ( { data } ) => {
        const authUser = await getAuthenticatedUser()

        // Validate provider if provided
        let provider = null
        if ( data.providerId ) {
            provider = await getProviderClientById( data.providerId )
            if ( !provider.proxyUploadsEnabled ) {
                // For downloads, proxy might work even if uploads don't
                // Let the download handler decide
            }
        }

        await logActivity( {
            userId: authUser.id,
            eventType: 's3_request',
            resourceType: 'file',
            objectKey: data.objectKey,
            metadata: {
                action: 'download_proxy',
                providerId: data.providerId,
            },
        } )

        // Return the proxy URL for the client to use
        // In a real implementation, you might return a signed URL or token
        return {
            downloadMethod: 'proxy',
            downloadUrl: `${PROXY_DOWNLOAD_URL}?key=${encodeURIComponent( data.objectKey )}`,
            providerId: data.providerId ?? null,
        }
    } )