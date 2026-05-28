import type { ObjectPayload } from '@/components/storage/object-operations-types'

type ObjectOperationsPropertiesTabProps = {
  payload: ObjectPayload
  objectKey: string
}

export function ObjectOperationsPropertiesTab({
  payload,
  objectKey,
}: ObjectOperationsPropertiesTabProps) {
  return (
    <div className="grid gap-3 rounded-lg border border-border/60 bg-muted/30 p-3 text-sm">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Object Key
        </p>
        <p className="break-all font-mono text-xs text-foreground">
          {objectKey}
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <p className="text-xs text-muted-foreground">Size</p>
          <p>{payload.properties.sizeInBytes} bytes</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Content type</p>
          <p>{payload.properties.mimeType ?? 'Unknown'}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Last modified</p>
          <p>{payload.properties.lastModified ?? 'Unknown'}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Storage class</p>
          <p>{payload.properties.storageClass ?? 'Standard'}</p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-xs text-muted-foreground">ETag / Checksum</p>
          <p className="break-all font-mono text-xs">
            {payload.properties.etag ?? 'Unknown'}
          </p>
        </div>
      </div>
    </div>
  )
}

