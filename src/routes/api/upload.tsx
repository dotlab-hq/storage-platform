import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/upload')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/api/upload"!</div>
}
