import crypto from 'node:crypto'

const IV_BYTES = 12
const KEY_BYTES = 32
const ALGORITHM = 'aes-256-gcm'

// Try multiple sources for the encryption key
function getEncryptionKey(): Buffer {
  // First try Cloudflare Workers env (if available)
  try {
    // @ts-ignore - cloudflare:workers import may not be available at build time
    const { env } = require('cloudflare:workers') as { env: Record<string, string> }
    if (env.STORAGE_PROVIDER_ENCRYPTION_KEY) {
      console.log('[Crypto] Using encryption key from Cloudflare env')
      return crypto.createHash('sha256').update(env.STORAGE_PROVIDER_ENCRYPTION_KEY).digest()
    }
  } catch (e) {
    console.log('[Crypto] Not in Cloudflare context or env not available:', e)
  }

  // Fall back to process.env (Node.js)
  const secret = process.env.STORAGE_PROVIDER_ENCRYPTION_KEY
  if (!secret) {
    console.error('[Crypto] Missing STORAGE_PROVIDER_ENCRYPTION_KEY in both Cloudflare and Node environments')
    throw new Error('Missing STORAGE_PROVIDER_ENCRYPTION_KEY. Ensure it is set in your environment.')
  }
  console.log('[Crypto] Using encryption key from process.env')
  const key = crypto.createHash('sha256').update(secret).digest()
  if (key.length !== KEY_BYTES) {
    throw new Error('Invalid encryption key size')
  }
  return key
}
    if (env.STORAGE_PROVIDER_ENCRYPTION_KEY) {
      return crypto
        .createHash('sha256')
        .update(env.STORAGE_PROVIDER_ENCRYPTION_KEY)
        .digest()
    }
  } catch {
    // Not in Cloudflare context, fall through
  }

  // Fall back to process.env (Node.js)
  const secret = process.env.STORAGE_PROVIDER_ENCRYPTION_KEY
  if (!secret) {
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
