import { defineConfig } from "@playwright/test"

export default defineConfig( {
    testDir: "./tests/s3",
    timeout: 60_000,
    expect: {
        timeout: 10_000,
    },
    fullyParallel: false,
    retries: 1,
    reporter: [["list"], ["html", { open: "never" }]],
    use: {
        baseURL: process.env.S3_TEST_ENDPOINT ?? "https://storage.wpsrde.dev",
        trace: "retain-on-failure",
    },
} )
