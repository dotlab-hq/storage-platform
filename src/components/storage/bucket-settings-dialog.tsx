'use client'

import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Save } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { validateCorsConfig } from '@/lib/cors-validator'

const tabs = ['overview', 'permissions', 'cors', 'versioning'] as const

type BucketSettingsDialogProps = {
  bucketName: string | null
  onOpenChange: (open: boolean) => void
}

type BucketSettingsPayload = {
  bucket: {
    name: string
    region: string
    objectOwnershipMode: string
    blockPublicAccess: boolean
  }
  versioning: 'enabled' | 'suspended' | 'disabled'
  policyJson: string
  corsRules: Array<{
    allowedOrigins: string[]
    allowedMethods: string[]
    allowedHeaders: string[]
    exposeHeaders: string[]
    maxAgeSeconds: number | null
  }>
  acl: 'private' | 'public-read'
}

async function fetchSettings(
  bucketName: string,
): Promise<BucketSettingsPayload> {
  const response = await fetch(
    `/api/storage/s3/bucket-settings?bucketName=${encodeURIComponent(bucketName)}`,
  )
  if (!response.ok) throw new Error('Failed to load bucket settings')
  const payload: BucketSettingsPayload = await response.json()
  return payload
}

export function BucketSettingsDialog(props: BucketSettingsDialogProps) {
  const { bucketName, onOpenChange } = props
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('overview')
  const [draftPolicy, setDraftPolicy] = useState<string>('')
  const [draftCors, setDraftCors] = useState<string>('[]')
  const [corsValidationError, setCorsValidationError] = useState<string>('')
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['bucket-settings', bucketName],
    queryFn: () => fetchSettings(bucketName ?? ''),
    enabled: bucketName !== null,
  })

  const mutation = useMutation({
    mutationFn: async (payload: unknown) => {
      const response = await fetch('/api/storage/s3/bucket-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const body: { error?: string } = await response.json()
        throw new Error(body.error ?? 'Update failed')
      }
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({
        queryKey: ['bucket-settings', bucketName],
      })
      const previous = queryClient.getQueryData<BucketSettingsPayload>([
        'bucket-settings',
        bucketName,
      ])
      if (
        !previous ||
        typeof payload !== 'object' ||
        payload === null ||
        !('action' in payload)
      ) {
        return { previous }
      }

      const actionPayload = payload as { action: string }
      if (actionPayload.action === 'versioning' && 'state' in actionPayload) {
        queryClient.setQueryData<BucketSettingsPayload>(
          ['bucket-settings', bucketName],
          {
            ...previous,
            versioning:
              actionPayload.state as BucketSettingsPayload['versioning'],
          },
        )
      }
      if (actionPayload.action === 'acl' && 'cannedAcl' in actionPayload) {
        queryClient.setQueryData<BucketSettingsPayload>(
          ['bucket-settings', bucketName],
          {
            ...previous,
            acl: actionPayload.cannedAcl as BucketSettingsPayload['acl'],
          },
        )
      }
      if (actionPayload.action === 'policy' && 'policyJson' in actionPayload) {
        queryClient.setQueryData<BucketSettingsPayload>(
          ['bucket-settings', bucketName],
          { ...previous, policyJson: actionPayload.policyJson as string },
        )
      }
      if (actionPayload.action === 'cors' && 'rules' in actionPayload) {
        queryClient.setQueryData<BucketSettingsPayload>(
          ['bucket-settings', bucketName],
          {
            ...previous,
            corsRules:
              actionPayload.rules as BucketSettingsPayload['corsRules'],
          },
        )
      }

      return { previous }
    },
    onError: (_error, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ['bucket-settings', bucketName],
          context.previous,
        )
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['bucket-settings', bucketName],
      })
    },
  })

  const payload = query.data
  const loading = query.isLoading || mutation.isPending

  const corsPretty = useMemo(
    () => JSON.stringify(payload?.corsRules ?? [], null, 2),
    [payload?.corsRules],
  )

  return (
    <Dialog open={bucketName !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bucket Settings</DialogTitle>
          <DialogDescription>
            {bucketName ? `Configure ${bucketName}` : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab}
              size="sm"
              variant={activeTab === tab ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </Button>
          ))}
        </div>

        {loading && (
          <div className="text-sm text-muted-foreground">
            <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
            Loading...
          </div>
        )}
        {query.error && (
          <div className="rounded border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
            {query.error.message}
          </div>
        )}
        {mutation.error && (
          <div className="rounded border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
            {mutation.error.message}
          </div>
        )}

        {payload && activeTab === 'overview' && (
          <div className="space-y-2 text-sm">
            <p>Region: {payload.bucket.region}</p>
            <p>Ownership: {payload.bucket.objectOwnershipMode}</p>
            <p>
              Block Public Access:{' '}
              {payload.bucket.blockPublicAccess ? 'Enabled' : 'Disabled'}
            </p>
          </div>
        )}

        {payload && activeTab === 'permissions' && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setDraftPolicy(
                    '{\n  "Version": "2012-10-17",\n  "Statement": [\n    {\n      "Effect": "Allow",\n      "Principal": "*",\n      "Action": ["s3:GetObject"],\n      "Resource": ["arn:aws:s3:::' +
                      bucketName +
                      '/*"]\n    }\n  ]\n}',
                  )
                }
              >
                Template: Public Read Policy
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDraftPolicy('')}
              >
                Clear Policy
              </Button>
            </div>
            <textarea
              aria-label="Bucket policy JSON"
              className="h-40 w-full rounded border p-2 text-xs"
              value={draftPolicy || payload.policyJson}
              onChange={(e) => setDraftPolicy(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() =>
                  mutation.mutate({
                    action: 'policy',
                    bucketName,
                    policyJson: draftPolicy || payload.policyJson,
                  })
                }
              >
                <Save className="h-4 w-4 mr-2" /> Save Policy
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  mutation.mutate({
                    action: 'acl',
                    bucketName,
                    cannedAcl: 'public-read',
                  })
                }
              >
                Template: Make Public Read
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  mutation.mutate({
                    action: 'acl',
                    bucketName,
                    cannedAcl: 'private',
                  })
                }
              >
                Template: Make Private
              </Button>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Current ACL: <strong>{payload.acl}</strong>
            </div>
          </div>
        )}

        {payload && activeTab === 'cors' && (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground mb-2">
              <p>
                <strong>Instructions:</strong> Enter a valid JSON array of CORS
                rules.
              </p>
              <ul className="list-disc pl-5 mt-1 text-xs">
                <li>
                  Keys should be PascalCase or camelCase (e.g., AllowedOrigins).
                </li>
                <li>
                  AllowedOrigins and AllowedMethods are required for each rule.
                </li>
                <li>Example Methods: GET, PUT, POST, DELETE, HEAD.</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setDraftCors(
                    '[\n  {\n    "AllowedOrigins": ["*"],\n    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],\n    "AllowedHeaders": ["*"],\n    "ExposeHeaders": ["ETag"],\n    "MaxAgeSeconds": 3000\n  }\n]',
                  )
                }
              >
                Load Public Template
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setDraftCors(
                    '[\n  {\n    "AllowedOrigins": ["https://yourdomain.com"],\n    "AllowedMethods": ["GET", "HEAD"],\n    "AllowedHeaders": ["Authorization"],\n    "MaxAgeSeconds": 3600\n  }\n]',
                  )
                }
              >
                Load Strict Template
              </Button>
            </div>
            <textarea
              aria-label="Bucket CORS rules JSON"
              className="h-40 w-full rounded border p-2 text-xs"
              value={draftCors || corsPretty}
              onChange={(e) => {
                setDraftCors(e.target.value)
                setCorsValidationError('')
              }}
            />
            {corsValidationError && (
              <Alert variant="destructive">
                <AlertDescription>{corsValidationError}</AlertDescription>
              </Alert>
            )}
            <Button
              size="sm"
              onClick={() => {
                try {
                  const parsedRules = JSON.parse(draftCors || corsPretty)

                  // Normalize field names to PascalCase
                  interface RawCorsRule {
                    AllowedOrigins?: string[]
                    allowedOrigins?: string[]
                    AllowedMethods?: string[]
                    allowedMethods?: string[]
                    AllowedHeaders?: string[]
                    allowedHeaders?: string[]
                    ExposeHeaders?: string[]
                    exposeHeaders?: string[]
                    MaxAgeSeconds?: number
                    maxAgeSeconds?: number
                  }

                  const normalizedRules = Array.isArray(parsedRules)
                    ? parsedRules.map((rule: RawCorsRule) => ({
                        AllowedOrigins:
                          rule.AllowedOrigins || rule.allowedOrigins,
                        AllowedMethods:
                          rule.AllowedMethods || rule.allowedMethods,
                        AllowedHeaders:
                          rule.AllowedHeaders || rule.allowedHeaders,
                        ExposeHeaders: rule.ExposeHeaders || rule.exposeHeaders,
                        MaxAgeSeconds: rule.MaxAgeSeconds ?? rule.maxAgeSeconds,
                      }))
                    : []

                  const corsConfig = { CORSRules: normalizedRules }
                  const validation = validateCorsConfig(corsConfig)

                  if (!validation.valid) {
                    const errorMessages = Object.entries(
                      validation.errors || {},
                    )
                      .map(([key, msgs]) => `${key}: ${msgs.join(', ')}`)
                      .join('\n')
                    setCorsValidationError(errorMessages)
                    return
                  }

                  mutation.mutate({
                    action: 'cors',
                    bucketName,
                    rules: normalizedRules,
                  })
                } catch (error) {
                  setCorsValidationError(
                    `Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
                  )
                }
              }}
            >
              Save CORS
            </Button>
          </div>
        )}

        {payload && activeTab === 'versioning' && (
          <div className="flex items-center gap-2">
            <Input value={payload.versioning} readOnly className="max-w-xs" />
            <Button
              size="sm"
              onClick={() =>
                mutation.mutate({
                  action: 'versioning',
                  bucketName,
                  state: 'enabled',
                })
              }
            >
              Enable
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                mutation.mutate({
                  action: 'versioning',
                  bucketName,
                  state: 'suspended',
                })
              }
            >
              Suspend
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                mutation.mutate({
                  action: 'versioning',
                  bucketName,
                  state: 'disabled',
                })
              }
            >
              Disable
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
