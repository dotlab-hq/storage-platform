import { createFileRoute } from '@tanstack/react-router'
import { handleS3Request } from '@/lib/s3-gateway/s3-dispatch'

export const Route = createFileRoute('/S3')({
  component: () => null,
  server: {
    handlers: {
      GET: async ({ request }) => handleS3Request(request),
      HEAD: async ({ request }) => handleS3Request(request),
      PUT: async ({ request }) => handleS3Request(request),
      DELETE: async ({ request }) => handleS3Request(request),
      POST: async ({ request }) => handleS3Request(request),
      OPTIONS: async ({ request }) => handleS3Request(request),
    },
  },
})
