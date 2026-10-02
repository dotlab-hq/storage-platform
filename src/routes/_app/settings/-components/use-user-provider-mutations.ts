import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { toast } from '@/components/ui/sonner'
import type { UserProvider } from '@/lib/storage-provider-queries'
import {
  deleteUserProviderFn,
  saveUserProviderFn,
  toggleUserProviderActiveFn,
  updateProviderPreferenceFn,
} from './-providers-server'
import {
  refreshSettings,
  settingsQuery,
  updateSettingsSnapshot,
  userProvidersQuery,
} from './settings-query'

export type SaveProviderInput = Parameters<typeof saveUserProviderFn>[0]['data']

const providersKey = userProvidersQuery().queryKey

/** Cancels in-flight fetches, applies `update`, and returns the old list. */
async function updateProviders(
  queryClient: QueryClient,
  update: (providers: UserProvider[]) => UserProvider[],
) {
  await queryClient.cancelQueries({ queryKey: providersKey })
  const previous = queryClient.getQueryData(providersKey)
  queryClient.setQueryData(providersKey, (providers) =>
    providers ? update(providers) : providers,
  )
  return { previous }
}

function optimisticProvider(input: SaveProviderInput): UserProvider {
  return {
    id: `temp-${crypto.randomUUID()}`,
    userId: 'optimistic-user',
    name: input.name,
    region: input.region ?? '',
    endpoint: input.endpoint ?? '',
    bucketName: input.bucketName ?? '',
    storageLimitBytes: input.storageLimitBytes,
    fileSizeLimitBytes: input.fileSizeLimitBytes,
    proxyUploadsEnabled: input.proxyUploadsEnabled ?? false,
    isActive: input.isActive ?? true,
    createdAt: new Date(),
    usedStorageBytes: 0,
    availableStorageBytes: input.storageLimitBytes,
  }
}

/** The edited provider as it will look once the server saves it. */
function applyEdit(
  provider: UserProvider,
  input: SaveProviderInput,
): UserProvider {
  return {
    ...provider,
    name: input.name,
    endpoint: input.endpoint || provider.endpoint,
    region: input.region || provider.region,
    bucketName: input.bucketName || provider.bucketName,
    storageLimitBytes: input.storageLimitBytes,
    fileSizeLimitBytes: input.fileSizeLimitBytes,
    proxyUploadsEnabled:
      input.proxyUploadsEnabled ?? provider.proxyUploadsEnabled,
    isActive: input.isActive ?? provider.isActive,
  }
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

/**
 * Mutations for the user's own storage providers and the system/custom
 * preference. All update the cache optimistically, roll back and toast on
 * error, and refetch when settled.
 */
export function useUserProviderMutations() {
  const queryClient = useQueryClient()
  const refreshProviders = () =>
    queryClient.invalidateQueries({ queryKey: providersKey })
  const rollback = (context?: { previous?: UserProvider[] }) => {
    if (context?.previous)
      queryClient.setQueryData(providersKey, context.previous)
  }

  const save = useMutation({
    mutationFn: (data: SaveProviderInput) => saveUserProviderFn({ data }),
    onMutate: (input) =>
      updateProviders(queryClient, (providers) =>
        input.providerId
          ? providers.map((provider) =>
              provider.id === input.providerId
                ? applyEdit(provider, input)
                : provider,
            )
          : [...providers, optimisticProvider(input)],
      ),
    onSuccess: () => toast.success('Provider saved'),
    onError: (error, _input, context) => {
      rollback(context)
      toast.error(errorMessage(error, 'Failed to save provider'))
    },
    onSettled: refreshProviders,
  })

  const remove = useMutation({
    mutationFn: (providerId: string) =>
      deleteUserProviderFn({ data: { providerId } }),
    onMutate: (providerId) =>
      updateProviders(queryClient, (providers) =>
        providers.filter((provider) => provider.id !== providerId),
      ),
    onSuccess: () => toast.success('Provider deleted'),
    onError: (error, _providerId, context) => {
      rollback(context)
      toast.error(errorMessage(error, 'Failed to delete provider'))
    },
    onSettled: refreshProviders,
  })

  const toggleActive = useMutation({
    mutationFn: (input: { providerId: string; isActive: boolean }) =>
      toggleUserProviderActiveFn({ data: input }),
    onMutate: ({ providerId, isActive }) =>
      updateProviders(queryClient, (providers) =>
        providers.map((provider) =>
          provider.id === providerId ? { ...provider, isActive } : provider,
        ),
      ),
    onError: (error, _input, context) => {
      rollback(context)
      toast.error(errorMessage(error, 'Failed to update provider status'))
    },
    onSettled: refreshProviders,
  })

  const setUseSystemProviders = useMutation({
    mutationFn: (useSystem: boolean) =>
      updateProviderPreferenceFn({ data: { use_system_providers: useSystem } }),
    onMutate: async (useSystem) => {
      await queryClient.cancelQueries({ queryKey: settingsQuery().queryKey })
      const previous = queryClient.getQueryData(settingsQuery().queryKey)
      updateSettingsSnapshot(queryClient, (snapshot) => ({
        ...snapshot,
        use_system_providers: useSystem,
      }))
      return { previous }
    },
    onError: (_error, _useSystem, context) => {
      if (context?.previous) {
        queryClient.setQueryData(settingsQuery().queryKey, context.previous)
      }
      toast.error('Failed to update provider preference')
    },
    onSettled: () => refreshSettings(queryClient),
  })

  return { save, remove, toggleActive, setUseSystemProviders }
}
