import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import svgr from 'vite-plugin-svgr'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig({
  
  server:{
    port: 3000
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    devtools(),
    tailwindcss(),
    tanstackStart(),
    svgr(),
    viteReact(),
  ],
  optimizeDeps: {
    noDiscovery: true,
    include: undefined,
  },
  build: {
    rollupOptions: {
      external: ['cloudflare:workers'],
    },
  },
})
export default config
