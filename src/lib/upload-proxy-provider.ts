import { getProviderClientById } from '@/lib/s3-provider-client'

export async function requireProxyProvider(providerId: string | null) {
  const provider = await getProviderClientById(providerId)
  if (!provider.proxyUploadsEnabled) {
    throw new Error('Proxy uploads are not enabled for this storage provider')
  }
  return provider
}
