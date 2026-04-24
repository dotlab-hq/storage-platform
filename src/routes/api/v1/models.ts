import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'

// @ts-expect-error - route type will be generated after router rebuild
export const Route = createFileRoute('/api/v1/models')({
  server: {
    handlers: {
      GET: GET,
      OPTIONS: OPTIONS,
    },
  },
})

export async function OPTIONS() {
  return json(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
    status: 204,
  })
}

export async function GET() {
  const models = [
    {
      id: 'gemini-4.0-flash',
      object: 'model',
      created: 1704067200, // Jan 1 2024
      owned_by: 'google',
      permission: [],
    },
    {
      id: 'gemini-4.0-pro',
      object: 'model',
      created: 1704067200,
      owned_by: 'google',
      permission: [],
    },
    {
      id: 'barrage-chat',
      object: 'model',
      created: 1704067200,
      owned_by: 'storage-platform',
      permission: [],
    },
  ]

  return json(
    {
      object: 'list',
      data: models,
    },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
  )
}
