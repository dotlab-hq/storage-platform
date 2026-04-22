/**
 * @client
 * Test utility to verify CORS validation works correctly
 * Usage: import and call validateCorsTestCases() in development
 */

import { validateCorsConfig, getDefaultCorsConfig } from './cors'

export function validateCorsTestCases(): void {
  console.log('=== CORS Validation Test Cases ===')

  // Test 1: Default config should be valid
  const defaultConfig = getDefaultCorsConfig()
  const test1 = validateCorsConfig(defaultConfig)
  console.log(
    'Test 1 - Default config:',
    test1.valid ? '✓ PASS' : '✗ FAIL',
    test1.errors,
  )

  // Test 2: Missing AllowedOrigins
  const test2 = validateCorsConfig({
    CORSRules: [
      {
        AllowedMethods: ['GET'],
        AllowedHeaders: ['*'],
        ExposeHeaders: [],
        MaxAgeSeconds: 3600,
      },
    ],
  })
  console.log(
    'Test 2 - Missing origins:',
    !test2.valid ? '✓ PASS' : '✗ FAIL',
    test2.errors,
  )

  // Test 3: Invalid method
  const test3 = validateCorsConfig({
    CORSRules: [
      {
        AllowedOrigins: ['*'],
        AllowedMethods: ['INVALID'],
        AllowedHeaders: ['*'],
        ExposeHeaders: [],
        MaxAgeSeconds: 3600,
      },
    ],
  })
  console.log(
    'Test 3 - Invalid method:',
    !test3.valid ? '✓ PASS' : '✗ FAIL',
    test3.errors,
  )

  // Test 4: MaxAgeSeconds out of range
  const test4 = validateCorsConfig({
    CORSRules: [
      {
        AllowedOrigins: ['*'],
        AllowedMethods: ['GET'],
        AllowedHeaders: ['*'],
        ExposeHeaders: [],
        MaxAgeSeconds: 999999,
      },
    ],
  })
  console.log(
    'Test 4 - MaxAge too high:',
    !test4.valid ? '✓ PASS' : '✗ FAIL',
    test4.errors,
  )

  // Test 5: Valid custom config
  const test5 = validateCorsConfig({
    CORSRules: [
      {
        AllowedOrigins: ['https://example.com', 'https://app.example.com'],
        AllowedMethods: ['GET', 'PUT', 'POST'],
        AllowedHeaders: ['Content-Type', 'Authorization'],
        ExposeHeaders: ['ETag', 'x-amz-version-id'],
        MaxAgeSeconds: 86400,
      },
    ],
  })
  console.log(
    'Test 5 - Custom valid config:',
    test5.valid ? '✓ PASS' : '✗ FAIL',
    test5.errors,
  )

  console.log('=== Tests Complete ===')
}
