declare module '@yaireo/tagify' {
  export interface TagifyOptions {
    whitelist?: string[]
    dropdown?: {
      enabled?: number
      maxItems?: number
      class?: string
      closeOnSelect?: boolean
    }
    templates?: {
      dropdownItemNoMatch?: (data: { value: string }) => string
      dropdownItem?: (data: { value: string; down?: boolean }) => string
      tag?: (data: { value: string }) => string
    }
    enforceWhitelist?: boolean
    keepInvalidTags?: boolean
    maxTags?: number
    editTags?: number
    delimiters?: string | null
  }

  export interface TagData {
    value: string
    [key: string]: unknown
  }

  export class Tagify {
    constructor(element: HTMLElement, options?: TagifyOptions)
    destroy(): void
    removeAllTags(): void
    addTags(tags: string | string[]): void
    get value(): TagData[]
    on(event: string, callback: (...args: unknown[]) => void): void
    off(event: string, callback?: (...args: unknown[]) => void): void
  }

  export default Tagify
}
