import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { cloudflare } from '@cloudflare/vite-plugin'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import svgr from 'vite-plugin-svgr'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// import { nitro } from 'nitro/vite'

const config = defineConfig( {
  server: {
    port: 3000,
  },
  build: {
    rollupOptions: {
      external: ["cloudflare:workers"],
    },
  },
  plugins: [
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
    tsconfigPaths( { projects: ['./tsconfig.json'] } ),
    tailwindcss(),
    tanstackStart( {
      prerender: {
        enabled: true,
        filter: ( page: { path: string } ) => !page.path.startsWith( '/api/' ),
      },
    } ),
    svgr(),
    cloudflare( { viteEnvironment: { name: 'ssr' }, } ),
    viteReact(),
  ],
} )

export default config
