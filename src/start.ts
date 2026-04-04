import { createStart } from '@tanstack/react-start'

import {
  adminServerFunctionMiddleware,
  authenticatedServerFunctionMiddleware,
} from '@/lib/route-auth-middleware'

export const startInstance = createStart(() => ({
  functionMiddleware: [
    authenticatedServerFunctionMiddleware,
    adminServerFunctionMiddleware,
  ],
}))
