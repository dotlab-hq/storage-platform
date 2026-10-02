import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/ui/sonner'
import {
  adminProvidersQuery,
  refreshAdminQueries,
} from '@/routes/_app/admin/-admin-queries'
import {
  deleteStorageProviderFn,
  setStorageProviderAvailabilityFn,
  triggerTrashCronFn,
} from '@/routes/_app/admin/-components/-admin-provider-fns'
import { saveStorageProviderFn } from '@/routes/_app/admin/-components/-admin-provider-save'

export type SaveProviderInput = Parameters<
  typeof saveStorageProviderFn
>[0]['data']

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

/** Create/update, toggle, delete providers and trigger the trash cron. */
export function useAdminProviderMutations() {
  const queryClient = useQueryClient()
  const providersKey = adminProvidersQuery().queryKey

  const saveProvider = useMutation({
    mutationFn: (data: SaveProviderInput) => saveStorageProviderFn({ data }),
    onSuccess: (result) => {
      toast.success(
        result.operation === 'updated'
          ? 'Storage provider updated'
          : 'Storage provider added',
      )
    },
    onError: (error) =>
      toast.error(errorMessage(error, 'Failed to save storage provider')),
    onSettled: () => refreshAdminQueries(queryClient, ['providers', 'summary']),
  })

  const setAvailability = useMutation({
    mutationFn: (data: { providerId: string; isActive: boolean }) =>
      setStorageProviderAvailabilityFn({ data }),
    onMutate: async ({ providerId, isActive }) => {
      await queryClient.cancelQueries({ queryKey: providersKey })
      const previous = queryClient.getQueryData(providersKey)
      queryClient.setQueryData(providersKey, (providers) =>
        providers?.map((provider) =>
          provider.id === providerId ? { ...provider, isActive } : provider,
        ),
      )
      return { previous }
    },
    onSuccess: (_result, { isActive }) => {
      toast.success(
        `Provider marked as ${isActive ? 'available' : 'unavailable'}`,
      )
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(providersKey, context.previous)
      }
      toast.error(errorMessage(error, 'Failed to update provider availability'))
    },
    onSettled: () => refreshAdminQueries(queryClient, ['providers']),
  })

  const deleteProvider = useMutation({
    mutationFn: (providerId: string) =>
      deleteStorageProviderFn({ data: { providerId } }),
    onSuccess: () => toast.success('Storage provider deleted'),
    onError: (error) =>
      toast.error(errorMessage(error, 'Failed to delete storage provider')),
    onSettled: () => refreshAdminQueries(queryClient, ['providers', 'summary']),
  })

  const triggerTrashCron = useMutation({
    mutationFn: () => triggerTrashCronFn(),
    onSuccess: (result) => toast.success(result.message),
    onError: (error) =>
      toast.error(errorMessage(error, 'Failed to trigger cron')),
  })

  return { saveProvider, setAvailability, deleteProvider, triggerTrashCron }
}
