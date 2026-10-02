import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const src = fileURLToPath(new URL('./src', import.meta.url))

// Unit tests run in plain Node. The app's vite.config.ts loads the
// Cloudflare worker plugin, which can't host Vitest, so it's not reused here.
export default defineConfig({
  resolve: {
    alias: [
      { find: /^@\//, replacement: `${src}/` },
      { find: /^#\//, replacement: `${src}/` },
    ],
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
