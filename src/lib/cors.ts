/**
 * CORS utilities barrel export
 * Combines validation, configuration management, and database conversion
 */

export {
    validateCorsConfig,
    getDefaultCorsConfig,
    convertDatabaseToCorsConfig,
    convertCorsConfigToDatabase,
    CorsConfigSchema,
    type CorsRule,
    type CorsConfig,
} from './cors-validator'

export {
    loadCorsConfig,
    getCachedCorsConfig,
    resetCorsConfigCache,
} from './cors-config-loader'
