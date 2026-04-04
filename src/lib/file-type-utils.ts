const TEXT_FILE_EXTENSIONS = new Set([
  'txt',
  'text',
  'md',
  'mdx',
  'rtf',
  'html',
  'htm',
  'css',
  'scss',
  'sass',
  'less',
  'js',
  'jsx',
  'ts',
  'tsx',
  'mjs',
  'cjs',
  'json',
  'jsonc',
  'yaml',
  'yml',
  'xml',
  'svg',
  'csv',
  'log',
  'ini',
  'conf',
  'env',
  'sh',
  'bash',
  'zsh',
  'ps1',
  'sql',
  'py',
  'java',
  'c',
  'cpp',
  'h',
  'hpp',
  'go',
  'rs',
  'php',
  'rb',
  'toml',
])

const EXTENSION_MIME_MAP: Record<string, string> = {
  txt: 'text/plain',
  text: 'text/plain',
  md: 'text/markdown',
  mdx: 'text/markdown',
  rtf: 'application/rtf',
  html: 'text/html',
  htm: 'text/html',
  css: 'text/css',
  scss: 'text/x-scss',
  sass: 'text/x-sass',
  less: 'text/x-less',
  js: 'application/javascript',
  jsx: 'text/jsx',
  ts: 'application/typescript',
  tsx: 'text/tsx',
  mjs: 'application/javascript',
  cjs: 'application/javascript',
  json: 'application/json',
  jsonc: 'application/json',
  yaml: 'application/yaml',
  yml: 'application/yaml',
  xml: 'application/xml',
  svg: 'image/svg+xml',
  csv: 'text/csv',
  log: 'text/plain',
  ini: 'text/plain',
  conf: 'text/plain',
  env: 'text/plain',
  sh: 'application/x-sh',
  bash: 'application/x-sh',
  zsh: 'application/x-sh',
  ps1: 'text/plain',
  sql: 'application/sql',
  py: 'text/x-python',
  java: 'text/x-java-source',
  c: 'text/x-c',
  cpp: 'text/x-c++src',
  h: 'text/x-c',
  hpp: 'text/x-c++hdr',
  go: 'text/x-go',
  rs: 'text/x-rustsrc',
  php: 'application/x-httpd-php',
  rb: 'application/x-ruby',
  toml: 'application/toml',
}

const TEXT_MIME_PREFIXES = ['text/']
const TEXT_MIME_TYPES = new Set([
  'application/json',
  'application/javascript',
  'application/typescript',
  'application/xml',
  'application/yaml',
  'application/sql',
  'application/rtf',
  'application/x-httpd-php',
  'application/x-ruby',
  'application/x-sh',
  'application/toml',
  'image/svg+xml',
])

export function getFileExtension(fileName: string): string | null {
  const dotIndex = fileName.lastIndexOf('.')
  if (dotIndex <= 0 || dotIndex === fileName.length - 1) {
    return null
  }

  return fileName.slice(dotIndex + 1).toLowerCase()
}

export function getMimeTypeFromFileName(fileName: string): string | null {
  const extension = getFileExtension(fileName)
  if (!extension) return null

  return EXTENSION_MIME_MAP[extension] ?? null
}

export function isTextMimeType(mimeType: string | null | undefined): boolean {
  if (!mimeType) return false

  if (TEXT_MIME_TYPES.has(mimeType)) {
    return true
  }

  return TEXT_MIME_PREFIXES.some((prefix) => mimeType.startsWith(prefix))
}

export function isTextBasedFile(
  fileName: string,
  mimeType: string | null | undefined,
): boolean {
  if (isTextMimeType(mimeType)) {
    return true
  }

  const extension = getFileExtension(fileName)
  return extension ? TEXT_FILE_EXTENSIONS.has(extension) : false
}

export function buildStorageObjectKey(
  userId: string,
  fileName: string,
): string {
  const extension = getFileExtension(fileName)
  const baseName =
    (extension ? fileName.slice(0, -(extension.length + 1)) : fileName)
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9._-]/g, '') || 'file'

  const safeExtension = extension
    ? `.${extension.replace(/[^a-zA-Z0-9]/g, '')}`
    : ''
  return `${userId}/${crypto.randomUUID()}-${baseName}${safeExtension}`
}
