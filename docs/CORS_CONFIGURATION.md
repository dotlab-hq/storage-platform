# CORS Configuration System

## Overview

The CORS (Cross-Origin Resource Sharing) configuration system provides:

- Default CORS configuration with open-to-all origins
- Client-side validation using Zod schemas
- Server-side configuration loading with caching
- Database conversion utilities
- Integration with the bucket settings UI

## Files

### 1. `cors.json` (Root)

Default CORS configuration file:

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["PUT", "GET", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

### 2. `src/lib/cors-validator.ts` (@client)

Client-only validation module with:

- `validateCorsConfig(config)` - Validates CORS config and returns validation result with errors
- `getDefaultCorsConfig()` - Returns default CORS configuration
- `convertDatabaseToCorsConfig(rules)` - Converts database JSON format to CorsConfig
- `convertCorsConfigToDatabase(config)` - Converts CorsConfig to database format
- Type exports: `CorsConfig`, `CorsRule`, `CorsConfigSchema`

### 3. `src/lib/cors-config-loader.ts` (@server)

Server-only configuration loader with:

- `loadCorsConfig()` - Loads cors.json, validates it, and caches the result
- `getCachedCorsConfig()` - Retrieves cached configuration
- `resetCorsConfigCache()` - Resets cache (useful for testing)

### 4. `src/lib/cors.ts`

Barrel export consolidating all CORS utilities for easy importing.

### 5. `src/components/storage/bucket-settings-dialog.tsx`

React component with integrated CORS validation:

- Displays CORS rules in JSON format in a textarea
- Validates rules before saving using `validateCorsConfig()`
- Shows error alerts for validation failures
- Clears errors when user modifies the input

## Usage Examples

### Client-Side Validation (React Components)

```typescript
import { validateCorsConfig, getDefaultCorsConfig } from '@/lib/cors'

// Get default config
const config = getDefaultCorsConfig()

// Validate a config
const result = validateCorsConfig(config)
if (result.valid) {
  console.log('Config is valid')
} else {
  console.error('Validation errors:', result.errors)
}
```

### Server-Side Configuration Loading

```typescript
import { loadCorsConfig, getCachedCorsConfig } from '@/lib/cors'

// Load configuration (validates automatically)
const config = await loadCorsConfig()

// Later, retrieve from cache
const cached = getCachedCorsConfig()
```

### Database Conversion

```typescript
import {
  convertDatabaseToCorsConfig,
  convertCorsConfigToDatabase,
} from '@/lib/cors'

// Convert from database format
const dbRules = [
  {
    allowedOriginsJson: '["*"]',
    allowedMethodsJson: '["GET","PUT"]',
    allowedHeadersJson: '["*"]',
    exposeHeadersJson: '["ETag"]',
    maxAgeSeconds: 3000,
  },
]
const config = convertDatabaseToCorsConfig(dbRules)

// Convert to database format
const dbFormat = convertCorsConfigToDatabase(config)
```

## Validation Rules

- **AllowedOrigins**: Array of strings, at least one required. Can use "\*" for all origins.
- **AllowedMethods**: Array of enum values: GET, PUT, POST, DELETE, HEAD, OPTIONS. At least one required.
- **AllowedHeaders**: Array of strings (optional). Defaults to ["*"]
- **ExposeHeaders**: Array of strings (optional). Defaults to []
- **MaxAgeSeconds**: Integer 0-604800 (optional). Defaults to 3600.

## Testing

Test utility available in `src/lib/cors-test.ts`:

```typescript
import { validateCorsTestCases } from '@/lib/cors-test'

// Run tests
validateCorsTestCases()
```

## Integration Points

1. **Bucket Settings Dialog** - Users can edit CORS rules in the UI with live validation
2. **S3 Gateway** - Can load default CORS config on startup
3. **API Routes** - Can use server-side loader to manage bucket CORS rules
