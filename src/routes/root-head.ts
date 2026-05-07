export function createRootHead(appCss: string) {
  return {
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'DOT. Storage — Secure Cloud Storage' },
      {
        name: 'description',
        content:
          'Secure, fast, and simple cloud file storage with end-to-end encryption. Store, share, and manage files safely in the cloud.',
      },
      {
        name: 'keywords',
        content:
          'cloud storage, secure file storage, encrypted storage, file sharing, document management, backup, online storage',
      },
      { name: 'author', content: 'DOT. Storage' },
      {
        name: 'robots',
        content:
          'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: 'DOT. Storage — Secure Cloud Storage' },
      {
        property: 'og:description',
        content:
          'Secure, fast, and simple cloud file storage with end-to-end encryption.',
      },
      { property: 'og:image', content: '/logo.svg' },
      { property: 'og:url', content: 'https://storage.wpsadi.dev' },
      { property: 'og:site_name', content: 'DOT. Storage' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'DOT. Storage — Secure Cloud Storage' },
      {
        name: 'twitter:description',
        content:
          'Secure, fast, and simple cloud file storage with end-to-end encryption.',
      },
      { name: 'twitter:image', content: '/logo.svg' },
      { name: 'theme-color', content: '#6229ff' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      {
        name: 'apple-mobile-web-app-status-bar-style',
        content: 'black-translucent',
      },
      { name: 'apple-mobile-web-app-title', content: 'DOT. Storage' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'manifest', href: '/manifest.json' },
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
      { rel: 'icon', href: '/logo.svg', type: 'image/svg+xml', sizes: 'any' },
      { rel: 'apple-touch-icon', href: '/logo.svg' },
      { rel: 'canonical', href: 'https://storage.wpsadi.dev' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    ],
  } as const
}
