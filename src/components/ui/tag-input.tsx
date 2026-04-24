'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import type { ApiScope } from '@/lib/permissions/scopes'
import { getAllScopes, getScopeDisplayName } from '@/lib/permissions/scopes'

// Import Tagify styles
import '@yaireo/tagify/dist/tagify.css'

export interface TagInputProps {
  value?: string[]
  onChange?: (tags: string[]) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function TagInput({
  value = [],
  onChange,
  placeholder = 'Add scopes...',
  disabled = false,
  className,
  ...props
}: TagInputProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const tagifyRef = React.useRef<any>(null)
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  // Initialize Tagify on mount
  React.useEffect(() => {
    let isMounted = true

    const init = async () => {
      const TagifyModule = await import('@yaireo/tagify')
      const Tagify = TagifyModule.default || TagifyModule

      if (!isMounted || !containerRef.current) return

      // Create input element
      const input = document.createElement('input')
      input.type = 'text'
      input.className =
        'tagify-input outline-none border-none bg-transparent flex-1 min-w-[120px] text-sm'
      input.placeholder = placeholder
      input.disabled = disabled
      input.setAttribute('autocomplete', 'off')
      input.setAttribute('spellcheck', 'false')

      containerRef.current.appendChild(input)
      inputRef.current = input

      const tagify = new Tagify(input, {
        whitelist: getAllScopes(),
        dropdown: {
          enabled: 0,
          maxItems: 20,
          class: 'tagify-dropdown',
          closeOnSelect: false,
        },
        templates: {
          dropdownItemNoMatch: (data: any) => `No match for "${data.value}"`,
          dropdownItem: (data: any) => `
            <div ${data.down ? 'aria-selected="true"' : ''} class="tagify__dropdown__item" tabindex="0">
              ${getScopeDisplayName(data.value as ApiScope)} <small class="opacity-70">(${data.value})</small>
            </div>
          `,
          tag: (data: any) => `
            <tag title="${data.value}" contenteditable="false" spellcheck="false" class="tagify__tag">
              <span class="tagify__tag-text">${getScopeDisplayName(data.value as ApiScope)}</span>
              <button class="tagify__tag__remove-btn" aria-label="Remove tag">&times;</button>
            </tag>
          `,
        },
        enforceWhitelist: true,
        keepInvalidTags: false,
        maxTags: 20,
        editTags: 1,
        delimiters: null,
      })

      tagifyRef.current = tagify

      // Set initial value
      if (value.length > 0) {
        tagify.removeAllTags()
        value.forEach((v) => tagify.addTags(v))
      }

      const handleChange = () => {
        const tags = tagify.value.map((item: any) => item.value)
        onChange?.(tags)
      }
      tagify.on('add remove', handleChange)

      return () => {
        tagify.destroy()
        if (input.parentNode) input.remove()
      }
    }

    init()

    return () => {
      isMounted = false
      if (tagifyRef.current) {
        tagifyRef.current.destroy()
      }
    }
  }, [])

  // Sync external value changes
  React.useEffect(() => {
    if (!tagifyRef.current) return
    const tagify = tagifyRef.current
    const currentTags = tagify.value.map((item: any) => item.value)
    if (JSON.stringify(currentTags.sort()) !== JSON.stringify(value.sort())) {
      tagify.removeAllTags()
      value.forEach((v) => tagify.addTags(v))
    }
  }, [value])

  // Sync disabled state
  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.disabled = disabled
    }
  }, [disabled])

  return (
    <div
      ref={containerRef}
      className={cn(
        'tagify-input-container',
        'flex flex-wrap gap-1 p-2 border border-input rounded-md bg-transparent min-h-[42px]',
        'focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
        disabled && 'pointer-events-none opacity-50',
        className,
      )}
      {...props}
    />
  )
}
