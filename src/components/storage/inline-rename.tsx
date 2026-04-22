import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

type InlineRenameProps = {
  name: string
  isRenaming: boolean
  onRename: (newName: string) => void
  onCancel: () => void
  isLoading?: boolean
}

export function InlineRename({
  name,
  isRenaming,
  onRename,
  onCancel,
  isLoading = false,
}: InlineRenameProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState(name)

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      setValue(name)
      inputRef.current.focus()

      // Select the name part without extension
      const dotIndex = name.lastIndexOf('.')
      const selectionEnd = dotIndex > 0 ? dotIndex : name.length
      inputRef.current.setSelectionRange(0, selectionEnd)
    }
  }, [isRenaming, name])

  if (!isRenaming) {
    return <span className="truncate">{name}</span>
  }

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (trimmed && trimmed !== name) {
      onRename(trimmed)
    } else {
      onCancel()
    }
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        placeholder="Enter name"
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSubmit()
          if (e.key === 'Escape') onCancel()
          e.stopPropagation()
        }}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'bg-background w-full rounded border px-1.5 py-0.5 text-sm outline-none',
          'focus:ring-primary/50 focus:ring-2',
          isLoading && 'animate-pulse opacity-50',
        )}
        disabled={isLoading}
      />
    </div>
  )
}
