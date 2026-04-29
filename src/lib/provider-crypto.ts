import crypto from 'node:crypto'

const IV_BYTES = 12
const KEY_BYTES = 32
const ALGORITHM = 'aes-256-gcm'

// Try multiple sources for the encryption key
function getEncryptionKey(): Buffer {
  // Use process.env (available in both Node.js dev and Cloudflare Workers via Vite)
  const secret = process.env.STORAGE_PROVIDER_ENCRYPTION_KEY
  if (!secret) {
    console.error(
      '[Crypto] Missing STORAGE_PROVIDER_ENCRYPTION_KEY environment variable',
    )
    throw new Error(
      'Missing STORAGE_PROVIDER_ENCRYPTION_KEY. Ensure it is set in your environment.',
    )
  }
  const key = crypto.createHash('sha256').update(secret).digest()
  if (key.length !== KEY_BYTES) {
    throw new Error('Invalid encryption key size')
  }
  return key
}

export function encryptProviderSecret(plainText: string): string {
  const iv = crypto.randomBytes(IV_BYTES)
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv)
  const encrypted = Buffer.concat([
    cipher.update(plainText, 'utf8'),
    cipher.final(),
  ])
  const tag = cipher.getAuthTag()
  return `${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`
}

export function decryptProviderSecret(encryptedValue: string): string {
  const [ivB64, tagB64, payloadB64] = encryptedValue.split(':')
  if (!ivB64 || !tagB64 || !payloadB64) {
    throw new Error('Invalid encrypted provider secret format')
  }
  const iv = Buffer.from(ivB64, 'base64')
  const tag = Buffer.from(tagB64, 'base64')
  const payload = Buffer.from(payloadB64, 'base64')
  const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv)
  decipher.setAuthTag(tag)
  const decrypted = Buffer.concat([decipher.update(payload), decipher.final()])
  return decrypted.toString('utf8')
}
