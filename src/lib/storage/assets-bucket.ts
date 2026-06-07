const ASSETS_SUFFIX_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789'

export function generateBucketNameSuffix(length = 5): string {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  let out = ''
  for (let i = 0; i < length; i += 1) {
    out += ASSETS_SUFFIX_ALPHABET[bytes[i] % ASSETS_SUFFIX_ALPHABET.length]
  }
  return out
}

export function generateDefaultAssetsBucketName(): string {
  return `assets-${generateBucketNameSuffix(5)}`
}
