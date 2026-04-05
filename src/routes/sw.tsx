import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import * as fs from 'node:fs'
import * as path from 'node:path'

export const Route = createFileRoute( '/sw' )( {
    component: () => null,
    server: {
        handlers: {
            GET: async () => {
                try {
                    const swContent = fs.readFileSync(
                        path.resolve( process.cwd(), 'public/sw.ts' ),
                        'utf-8',
                    )
                    return new Response( swContent, {
                        headers: {
                            'Content-Type': 'application/javascript',
                            'Service-Worker-Allowed': '/',
                        },
                    } )
                } catch ( err ) {
                    return new Response( 'console.error("SW not found");', {
                        status: 404,
                        headers: { 'Content-Type': 'application/javascript' }
                    } )
                }
            },
        },
    },
} )