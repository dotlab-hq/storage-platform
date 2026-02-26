import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/storage/root-items')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/api/storage/root-items"!</div>
}
