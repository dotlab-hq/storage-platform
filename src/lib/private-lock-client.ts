import { createClientOnlyFn } from '@tanstack/react-start'
import { setFolderPrivateLockFn } from './storage/mutations/private-lock'

export const setFolderPrivateLockClient = createClientOnlyFn(
  async (folderId: string, isPrivatelyLocked: boolean) => {
    const data = await setFolderPrivateLockFn({
      data: { folderId, isPrivatelyLocked },
    })
    return data.folder
  },
)
