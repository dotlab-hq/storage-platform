import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import {
  getShareByToken,
  getSharedFolderTreeByToken,
  getSharedFilePresignedUrl,
  getSharedFileDownloadUrl,
} from '@/lib/share-queries'

type FileItem = {
  id: string
  name: string
  mimeType: string | null
  sizeInBytes: number
  objectKey: string
  providerId: string | null
}

type FolderItem = { id: string; name: string }

export type FolderTreePayload = {
  rootFolderId: string
  rootFolderName: string
  folders: {
    id: string
    name: string
    parentFolderId: string | null
    depth: number
  }[]
  files: {
    id: string
    name: string
    mimeType: string | null
    sizeInBytes: number
    folderId: string | null
  }[]
}

export type SharePagePayload =
  | {
    type: 'file'
    name: string
    mimeType: string | null
    sizeInBytes: number
    presignedUrl: string
  }
  | {
    type: 'folder'
    name: string
    folderId: string
    tree: FolderTreePayload | null
  }

export const getShareAccessFn = createServerFn( { method: 'GET' } )
  .inputValidator( z.object( { token: z.string() } ) )
  .handler( async ( { data } ) => {
    const result = await getShareByToken( {
      data: { token: data.token },
    } )
    if ( !result ) throw new Error( 'Share link not found, expired, or inactive' )

    if ( result.type === 'file' ) {
      const fileItem = result.item as FileItem
      const { presignedUrl } = await getSharedFilePresignedUrl(
        {
          data: {
            objectKey: fileItem.objectKey,
            fileName: fileItem.name,
            providerId: fileItem.providerId!,
          }
        }
      )
      return {
        type: 'file' as const,
        name: fileItem.name,
        mimeType: fileItem.mimeType,
        sizeInBytes: fileItem.sizeInBytes,
        presignedUrl,
      }
    }

    const folderItem = result.item as FolderItem
    return {
      type: 'folder' as const,
      name: folderItem.name,
      folderId: folderItem.id,
    }
  } )

export const getFolderTreeAccessFn = createServerFn( { method: 'GET' } )
  .inputValidator( z.object( { token: z.string() } ) )
  .handler( async ( { data } ) => {
    const result = await getShareByToken( {
      data: { token: data.token },
    } )
    if ( !result ) throw new Error( 'Share link not found, expired, or inactive' )
    if ( result.type !== 'folder' ) throw new Error( 'Share link is not a folder' )
    const folderItem = result.item as FolderItem
    const tree = await getSharedFolderTreeByToken( {
      data: { token: data.token }
    } )
    return {
      type: 'folder' as const,
      name: folderItem.name,
      folderId: folderItem.id,
      tree,
    }
  } )

export const getShareDownloadUrlFn = createServerFn( { method: 'GET' } )
  .inputValidator( z.object( { token: z.string() } ) )
  .handler( async ( { data } ) => {
    const result = await getShareByToken( {
      data: { token: data.token }
    } )
    if ( !result ) throw new Error( 'Share link not found, expired, or inactive' )
    if ( result.type !== 'file' ) throw new Error( 'Share link is not a file' )
    const fileItem = result.item as FileItem
    const { presignedUrl: url } = await getSharedFileDownloadUrl(
      {
        data: {
          objectKey: fileItem.objectKey,
          fileName: fileItem.name,
          providerId: fileItem.providerId!,
        }
      }
    )
    return { url, name: fileItem.name }
  } )

export const getSharePageDataFn = createServerFn( { method: 'GET' } )
  .inputValidator( z.object( { token: z.string() } ) )
  .handler( async ( { data } ) => {
    const result = await getShareByToken( {
      data: { token: data.token }
    } )
    if ( !result ) {
      throw new Error( 'Share link not found, expired, or inactive' )
    }

    console.log( 'Share result:', result )

    if ( result.type === 'file' ) {
      const fileItem = result.item as FileItem
      const { presignedUrl } = await getSharedFilePresignedUrl(
        {
          data: {
            objectKey: fileItem.objectKey,
            fileName: fileItem.name,
            providerId: fileItem.providerId!,
          }
        }
      )
      return {
        type: 'file',
        name: fileItem.name,
        mimeType: fileItem.mimeType,
        sizeInBytes: fileItem.sizeInBytes,
        presignedUrl,
      } as SharePagePayload
    }

    const folderItem = result.item as FolderItem
    const tree = await getSharedFolderTreeByToken( {
      data: { token: data.token }
    } )
    return {
      type: 'folder',
      name: folderItem.name,
      folderId: folderItem.id,
      tree,
    } as SharePagePayload
  } )
