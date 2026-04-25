import * as React from 'react'
import { useHotkey } from '@tanstack/react-hotkeys'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { KeyboardShortcut } from '@/components/ui/keyboard-shortcut'

type SearchBarProps = {
  onSearch: (query: string) => void
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const formRef = React.useRef<HTMLFormElement>(null)
  const [query, setQuery] = React.useState('')

  const submitSearch = React.useEffectEvent(() => {
    onSearch(query)
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitSearch()
  }

  useHotkey(
    'Enter',
    () => {
      formRef.current?.requestSubmit()
    },
    { target: formRef },
  )

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex w-full max-w-xs"
    >
      <Input
        placeholder="Search files and folders..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1"
      />
      <Button type="submit" variant="outline" size="sm" className="ml-2">
        Search
        <KeyboardShortcut keys="Enter" className="ml-2" />
      </Button>
    </form>
  )
}
