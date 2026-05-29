import { createFileRoute } from '@tanstack/react-router'
import { handleWebDavRequest } from '@/lib/webdav/handler'

const handle = ({ request }: { request: Request }) => handleWebDavRequest(request)

export const Route = createFileRoute('/api/storage/webdav/$')({
  component: () => null,
  server: {
    handlers: {
      GET: handle,
      HEAD: handle,
      PUT: handle,
      DELETE: handle,
      OPTIONS: handle,
      PROPFIND: handle,
      PROPPATCH: handle,
      MKCOL: handle,
      COPY: handle,
      MOVE: handle,
      LOCK: handle,
      UNLOCK: handle,
    },
  },
})
