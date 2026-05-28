import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import type { ObjectPayload } from '@/components/storage/object-operations-types'

type TagDraft = { id: string; key: string; value: string }

type ObjectOperationsTagsTabProps = {
  payload: ObjectPayload
  onSave: (tags: ObjectPayload['tags']) => void
  isPending: boolean
}

function toDraft(tags: ObjectPayload['tags']): TagDraft[] {
  if (tags.length === 0) {
    return [{ id: crypto.randomUUID(), key: '', value: '' }]
  }
  return tags.map((tag) => ({
    id: crypto.randomUUID(),
    key: tag.key,
    value: tag.value,
  }))
}

export function ObjectOperationsTagsTab({
  payload,
  onSave,
  isPending,
}: ObjectOperationsTagsTabProps) {
  const [draftTags, setDraftTags] = useState<TagDraft[]>(() =>
    toDraft(payload.tags),
  )

  useEffect(() => {
    setDraftTags(toDraft(payload.tags))
  }, [payload.tags])

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {draftTags.map((tag) => (
          <div key={tag.id} className="grid gap-2 sm:grid-cols-2">
            <input
              value={tag.key}
              onChange={(event) =>
                setDraftTags((prev) =>
                  prev.map((item) =>
                    item.id === tag.id
                      ? { ...item, key: event.target.value }
                      : item,
                  ),
                )
              }
              placeholder="Tag key"
              className="rounded-md border border-emerald-500/20 bg-muted/30 px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
            <input
              value={tag.value}
              onChange={(event) =>
                setDraftTags((prev) =>
                  prev.map((item) =>
                    item.id === tag.id
                      ? { ...item, value: event.target.value }
                      : item,
                  ),
                )
              }
              placeholder="Tag value"
              className="rounded-md border border-emerald-500/20 bg-muted/30 px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            setDraftTags((prev) => [
              ...prev,
              { id: crypto.randomUUID(), key: '', value: '' },
            ])
          }
          className="border-emerald-500/30 bg-muted/20 text-emerald-100"
        >
          Add tag row
        </Button>
        <Button
          size="sm"
          onClick={() =>
            onSave(
              draftTags
                .map((tag) => ({
                  key: tag.key.trim(),
                  value: tag.value.trim(),
                }))
                .filter((tag) => tag.key.length > 0),
            )
          }
          disabled={isPending}
        >
          Save Tags
        </Button>
      </div>
    </div>
  )
}
