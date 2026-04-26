import { config as loadEnv } from 'dotenv'
import { defineConfig } from '@playwright/test'

loadEnv({ path: 'tests/s3/.env.s3.compat.local' })

export default defineConfig({
  testDir: './tests/s3',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  reporter: process.env.CI ? 'github' : 'list',
})
