import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import svgr from 'vite-plugin-svgr'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// import { nitro } from 'nitro/vite'

const config = defineConfig( {
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: 3000,
  },
  build: {
    rollupOptions: {
      external: ['cloudflare:workers'],
      output: {
        manualChunks( id ) {
          const heavyLibs = [
            'react',
            'react-dom',
            '@tanstack/react-query',
            '@tanstack/react-router',
            '@tanstack/react-query-devtools',
            '@tanstack/react-router-ssr-query',
            '@tanstack/react-start',
            '@tanstack/store',
            '@tanstack/db',
            'react-jsx-parser',
            '@xyflow/react',
            'shiki',
            'streamdown',
            '@streamdown/code',
            '@streamdown/cjk',
            '@streamdown/math',
            '@streamdown/mermaid',
            'motion',
            'mermaid',
            'quill',
            'highlight.js',
            'katex',
            'zustand',
            '@rive-app/react-webgl2',
          ]

          if ( id.includes( 'node_modules' ) && !id.includes( 'cloudflare:' ) ) {
            // Find the package name after the *last* node_modules segment to support pnpm's layout:
            // node_modules/.pnpm/.../node_modules/<package-name>/...
            const marker = 'node_modules/'
            const lastIdx = id.lastIndexOf( marker )
            if ( lastIdx !== -1 ) {
              const after = id.slice( lastIdx + marker.length )
              // after starts with either '<package>' or '@<scope>/<package>'
              const segments = after.split( '/' )
              let pkg: string
              if ( segments[0].startsWith( '@' ) ) {
                pkg = `${segments[0]}/${segments[1]}`
              } else {
                pkg = segments[0]
              }
              if ( heavyLibs.includes( pkg ) ) {
                return pkg.replace( '@', '' ).replace( /\//g, '-' )
              }
            }
            // For non-heavy node_modules, fall through (no split)
          }
        },
      },
    },
  },
  plugins: [
    cloudflare( {
      viteEnvironment: { name: 'ssr' }
    } ),
    devtools(),
    // nitro( {
    //   preset: 'cloudflare_module',
    //   rollupConfig: { external: [/^@sentry\//] },

    //   cloudflare: {
    //     deployConfig: true,
    //     wrangler: {
    //       name: 'storage',
    //       keep_vars: true,
    //       "compatibility_date": "2026-03-10",
    //       compatibility_flags: [
    //         "nodejs_compat",
    //         "no_handle_cross_request_promise_resolution"
    //       ],
    //       // "placement": {
    //       //   mode: "smart",
    //       //   hint: "aws:ap-south-1"
    //       // },
    //       hyperdrive: [
    //         {
    //           "binding": "DB",
    //           "id": "3c26563cafef4f44a700a5ec0b63b693",

    //           // Optional. Can be used to connect to a local database for local development with `wrangler dev`
    //           // "localConnectionString": "<LOCAL_CONNECTION_STRING_FOR_LOCAL_DEVELOPMENT_HERE>"
    //         }
    //       ],
    //       preview_urls: false,
    //       workers_dev: false,
    //       "observability": {
    //         "enabled": false,
    //         "head_sampling_rate": 1,
    //         "logs": {
    //           "enabled": true,
    //           "head_sampling_rate": 1,
    //           "invocation_logs": true
    //         },
    //       }
    //     },

    //     nodeCompat: true
    //   }
    //   // output: {
    //   //   dir: ".vercel/output",
    //   // },
    //   // vercel: {

    //   //   functions: {
    //   //     runtime: "bun1.x"

    //   //   },

    //   // }

    // } ),
    tailwindcss(),
    tanstackStart( {
      routeFileIgnorePattern: '^tools$',
    } ),
    svgr(),
    viteReact(),
  ],
} )

export default config
