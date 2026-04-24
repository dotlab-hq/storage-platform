declare module '@yaireo/tagify' {
  export interface TagifyOptions {
    whitelist?: string[]
    dropdown?: {
      enabled?: number
      maxItems?: number
      class?: string
      closeOnSelect?: boolean
    }
    // Add other options as needed
  }
  export class Tagify {
    constructor(select: HTMLSelectElement, options?: TagifyOptions)
    destroy(): void
    // other methods...
  }
  export default Tagify
}
