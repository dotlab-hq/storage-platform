'use client'

import * as React from 'react'
import { Code2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  normalizeUrlImportMode,
  URL_IMPORT_MODE_EVENT,
  URL_IMPORT_MODE_STORAGE_KEY,
} from '@/components/storage/url-import-mode'

export function UrlImportModeToggle() {
  const [enabled, setEnabled] = React.useState(false)

  React.useEffect(() => {
    const stored = localStorage.getItem(URL_IMPORT_MODE_STORAGE_KEY)
    setEnabled(normalizeUrlImportMode(stored) === 'code')

    const handleChange = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail
      setEnabled(normalizeUrlImportMode(detail) === 'code')
    }
    window.addEventListener(
      URL_IMPORT_MODE_EVENT,
      handleChange as EventListener,
    )
    return () => {
      window.removeEventListener(
        URL_IMPORT_MODE_EVENT,
        handleChange as EventListener,
      )
    }
  }, [])

  const toggle = () => {
    const nextMode = enabled ? 'form' : 'code'
    setEnabled(nextMode === 'code')
    localStorage.setItem(URL_IMPORT_MODE_STORAGE_KEY, nextMode)
    window.dispatchEvent(
      new CustomEvent(URL_IMPORT_MODE_EVENT, { detail: nextMode }),
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant={enabled ? 'default' : 'ghost'}
          onClick={toggle}
          aria-label={enabled ? 'Disable code mode' : 'Enable code mode'}
        >
          <Code2 className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {enabled ? 'Code mode enabled' : 'Code mode disabled'}
      </TooltipContent>
    </Tooltip>
  )
}
