import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import svgr from 'vite-plugin-svgr'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const devtoolsPort = Number(process.env.TANSTACK_DEVTOOLS_PORT ?? 42071)

const config = defineConfig({
  
  server:{
    port: 3000
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    devtools({ eventBusConfig: { port: devtoolsPort } }),
    tailwindcss(),
    tanstackStart(),
    svgr(),
    viteReact(),
  ],
  optimizeDeps: {
    noDiscovery: true,
    include: [
      'qrcode',
      'use-sync-external-store/shim',
      'use-sync-external-store/shim/with-selector',
      // The /landing 3D hero pulls in CommonJS packages (zustand v4,
      // scheduler, ...). With `noDiscovery` they must be pre-bundled here or
      // the dev server serves them raw and the page crashes.
      '@react-three/fiber',
      '@react-three/drei',
      'use-sync-external-store/shim/index.js',
      'use-sync-external-store/shim/with-selector.js',
      'scheduler',
    ],
  },
  build: {
    rollupOptions: {
      external: ['cloudflare:workers'],
    },
  },
})
export default config
