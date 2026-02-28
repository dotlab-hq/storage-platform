import { defineNitroConfig } from 'nitro/config'

export default defineNitroConfig( {
    // Disable body parsing for large requests
    // Clients now upload directly to S3 using presigned URLs
    routeRules: {
        '/api/**': { cache: false, headers: { 'x-nitro-prerender': 'false' } }
    }
} )
