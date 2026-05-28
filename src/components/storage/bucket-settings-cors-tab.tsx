import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { validateCorsConfig } from '@/lib/cors-validator'
import type {
  BucketSettingsPayload,
  BucketSettingsUpdate,
} from '@/components/storage/bucket-settings-types'

type BucketSettingsCorsTabProps = {
  bucketName: string
  payload: BucketSettingsPayload
  onUpdate: (update: BucketSettingsUpdate) => void
  isPending: boolean
}

type RawCorsRule = {
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

const publicTemplate =
  '[\n  {\n    "AllowedOrigins": ["*"],\n    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],\n    "AllowedHeaders": ["*"],\n    "ExposeHeaders": ["ETag"],\n    "MaxAgeSeconds": 3000\n  }\n]'

const strictTemplate =
  '[\n  {\n    "AllowedOrigins": ["https://yourdomain.com"],\n    "AllowedMethods": ["GET", "HEAD"],\n    "AllowedHeaders": ["Authorization"],\n    "MaxAgeSeconds": 3600\n  }\n]'

export function BucketSettingsCorsTab({
  bucketName,
  payload,
  onUpdate,
  isPending,
}: BucketSettingsCorsTabProps) {
  const [draftCors, setDraftCors] = useState('')
  const [corsValidationError, setCorsValidationError] = useState('')

  const corsPretty = useMemo(
    () => JSON.stringify(payload.corsRules ?? [], null, 2),
    [payload.corsRules],
  )

  useEffect(() => {
    setDraftCors(corsPretty)
  }, [corsPretty])

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">CORS Rules</p>
        <p className="mt-1">
          Provide JSON rules in PascalCase or camelCase. AllowedOrigins and
          AllowedMethods are required.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setDraftCors(publicTemplate)}
          className="border-border/60 bg-muted/30 text-foreground"
        >
          Load Public Template
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setDraftCors(strictTemplate)}
          className="border-border/60 bg-muted/30 text-foreground"
        >
          Load Strict Template
        </Button>
      </div>

      <textarea
        aria-label="Bucket CORS rules JSON"
        className="h-48 w-full rounded-lg border border border-border/60 bg-muted/30 p-3 font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/70/40"
        value={draftCors}
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

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Current rules: {payload.corsRules.length}
        </p>
        <Button
          size="sm"
          onClick={() => {
            try {
              const parsedRules = JSON.parse(draftCors)
              const normalizedRules = Array.isArray(parsedRules)
                ? parsedRules.map((rule: RawCorsRule) => ({
                    allowedOrigins: rule.AllowedOrigins || rule.allowedOrigins || [],
                    allowedMethods: rule.AllowedMethods || rule.allowedMethods || [],
                    allowedHeaders: rule.AllowedHeaders || rule.allowedHeaders || [],
                    exposeHeaders: rule.ExposeHeaders || rule.exposeHeaders || [],
                    maxAgeSeconds:
                      rule.MaxAgeSeconds ?? rule.maxAgeSeconds ?? null,
                  }))
                : []

              const corsConfig = {
                CORSRules: normalizedRules.map((rule) => ({
                  AllowedOrigins: rule.allowedOrigins,
                  AllowedMethods: rule.allowedMethods,
                  AllowedHeaders: rule.allowedHeaders,
                  ExposeHeaders: rule.exposeHeaders,
                  MaxAgeSeconds: rule.maxAgeSeconds ?? undefined,
                })),
              }
              const validation = validateCorsConfig(corsConfig)

              if (!validation.valid) {
                const errorMessages = Object.entries(validation.errors || {})
                  .map(([key, msgs]) => `${key}: ${msgs.join(', ')}`)
                  .join('\n')
                setCorsValidationError(errorMessages)
                return
              }

              onUpdate({
                action: 'cors',
                bucketName,
                rules: normalizedRules,
              })
            } catch (error) {
              setCorsValidationError(
                `Invalid JSON: ${
                  error instanceof Error ? error.message : 'Unknown error'
                }`,
              )
            }
          }}
          disabled={isPending}
        >
          Save CORS
        </Button>
      </div>
    </div>
  )
}


