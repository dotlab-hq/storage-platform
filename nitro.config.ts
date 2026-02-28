import { defineNitroConfig } from 'nitro/config'

export default defineNitroConfig( {
    payloadExtraction: false,
    handlers: [
        {
            route: '/api/**',
            middleware: true,
            handler: async ( event ) => {
                // Ensure body size limit is increased for file uploads
                event.node.req.headers['content-length-limit'] = '100mb'
            }
        }
    ],
    // Configure request body size limit (100MB)
    // This is the maximum size for incoming requests
    bodyParser: {
        json: { limit: '100mb' },
        form: { limit: '100mb' },
        urlencoded: { limit: '100mb' }
    },
    // Increase timeout for large file uploads
    routeRules: {
        '/api/upload': { cache: false, headers: { 'x-nitro-prerender': 'false' } }
    }
} )
