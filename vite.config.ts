import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import tsconfigPaths from 'vite-tsconfig-paths'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const config = defineConfig( {
  plugins: [
    devtools(),
    nitro( {
      preset: 'vercel',
      rollupConfig: { external: [/^@sentry\//] },

      // cloudflare: {
      //   deployConfig: true,
      //   wrangler: {
      //     "observability": {
      //       "enabled": false,
      //       "head_sampling_rate": 1,
      //       "logs": {
      //         "enabled": true,
      //         "head_sampling_rate": 1,
      //         "invocation_logs": true
      //       },
      //     }
      //   },
      //   nodeCompat: true
      // }
      output: {
        dir: ".vercel/output",
      },
      vercel: {

        functions: {
          runtime: "bun1.x"

        },

      }

    } ),
    tsconfigPaths( { projects: ['./tsconfig.json'] } ),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
} )

export default config
