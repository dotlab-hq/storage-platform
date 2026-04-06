'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import type {
  UrlImportDialogState,
  UrlValidationState,
} from '@/components/storage/url-import-dialog-types'
import { UrlImportRecentJobs } from '@/components/storage/url-import-recent-jobs'

type UrlImportFormProps = {
  state: UrlImportDialogState
  validation: UrlValidationState
  onUrlChange: (value: string) => void
  onSavePathChange: (value: string) => void
  onMethodChange: (value: string) => void
  onHeadersChange: (value: string) => void
  onCookiesChange: (value: string) => void
  onCurlChange: (value: string) => void
  generatedCurl: string
  curlError: string | null
}

export function UrlImportForm({
  state,
  validation,
  onUrlChange,
  onSavePathChange,
  onMethodChange,
  onHeadersChange,
  onCookiesChange,
  onCurlChange,
  generatedCurl,
  curlError,
}: UrlImportFormProps) {
  if (state.mode === 'code') {
    return (
      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="savePath">Save Path / Name</Label>
          <Input
            id="savePath"
            placeholder="reports/daily-file.json"
            value={state.savePath}
            onChange={(event) => onSavePathChange(event.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="curlCommand">cURL command (safe subset only)</Label>
          <Textarea
            id="curlCommand"
            rows={5}
            value={state.curlCommand}
            onChange={(event) => onCurlChange(event.target.value)}
            placeholder="curl -X GET 'https://example.com/file.json' -H 'accept: application/json'"
          />
        </div>
        {curlError && <p className="text-destructive text-xs">{curlError}</p>}
        <Separator />
        <div className="space-y-1">
          <Label htmlFor="generatedCurl">Generated cURL preview</Label>
          <Textarea
            id="generatedCurl"
            rows={4}
            value={generatedCurl}
            readOnly
          />
        </div>
        <p
          className={`text-xs ${validation.ok ? 'text-emerald-600' : 'text-muted-foreground'}`}
        >
          {validation.loading ? 'Validating URL...' : validation.message}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="url">URL</Label>
        <Input
          id="url"
          placeholder="https://example.com/file.json"
          value={state.url}
          onChange={(event) => onUrlChange(event.target.value)}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="savePath">Save Path / Name</Label>
        <Input
          id="savePath"
          placeholder="reports/daily-file.json"
          value={state.savePath}
          onChange={(event) => onSavePathChange(event.target.value)}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="method">Method</Label>
        <Input
          id="method"
          value={state.method}
          onChange={(event) => onMethodChange(event.target.value)}
          placeholder="GET | POST | PUT | PATCH"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="headers">Headers (key:value per line)</Label>
        <Textarea
          id="headers"
          rows={4}
          value={state.headersRaw}
          onChange={(event) => onHeadersChange(event.target.value)}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="cookies">Cookies (key:value per line)</Label>
        <Textarea
          id="cookies"
          rows={3}
          value={state.cookiesRaw}
          onChange={(event) => onCookiesChange(event.target.value)}
        />
      </div>
      <p
        className={`text-xs ${validation.ok ? 'text-emerald-600' : 'text-muted-foreground'}`}
      >
        {validation.loading ? 'Validating URL...' : validation.message}
      </p>
      <Separator />
      <div className="space-y-1">
        <Label htmlFor="generatedCurl">Generated cURL preview</Label>
        <Textarea id="generatedCurl" rows={4} value={generatedCurl} readOnly />
      </div>
      <UrlImportRecentJobs />
    </div>
  )
}
