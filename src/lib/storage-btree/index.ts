import { and, eq, like, or } from 'drizzle-orm'
import { db } from '@/db'
import { folder } from '@/db/schema/storage'
import { storageNodeBtree } from '@/db/schema/storage-btree'
import {
  descendantPrefix,
  joinPath,
  normalizePath,
} from '@/lib/storage-btree/path'

type NodeType = 'folder' | 'file'

type UpsertFileInput = {
  userId: string
  fileId: string
  name: string
  folderId: string | null
  isDeleted: boolean
  sizeInBytes?: number | null
  etag?: string | null
  lastModified?: Date | null
}

async function getNodePath(userId: string, folderId: string | null) {
  if (!folderId) return ''
  const rows = await db
    .select({ fullPath: storageNodeBtree.fullPath })
    .from(storageNodeBtree)
    .where(
      and(
        eq(storageNodeBtree.userId, userId),
        eq(storageNodeBtree.nodeType, 'folder'),
        eq(storageNodeBtree.nodeId, folderId),
      ),
    )
    .limit(1)
  return rows[0]?.fullPath ?? null
}

async function resolveParentPath(
  userId: string,
  folderId: string | null,
  visited = new Set<string>(),
): Promise<string> {
  if (!folderId) return ''
  const existingPath = await getNodePath(userId, folderId)
  if (existingPath !== null) return existingPath
  if (visited.has(folderId)) return ''

  visited.add(folderId)
  const rows = await db
    .select({
      id: folder.id,
      name: folder.name,
      parentFolderId: folder.parentFolderId,
      isDeleted: folder.isDeleted,
      isTrashed: folder.isTrashed,
    })
    .from(folder)
    .where(and(eq(folder.id, folderId), eq(folder.userId, userId)))
    .limit(1)
  const parent = rows[0]
  if (!parent) return ''

  const parentPath = await resolveParentPath(
    userId,
    parent.parentFolderId,
    visited,
  )
  const folderPath = normalizePath(parentPath)
  const fullPath = joinPath(folderPath, parent.name)
  const isDeleted = parent.isDeleted || parent.isTrashed
  await db
    .insert(storageNodeBtree)
    .values({
      userId,
      nodeType: 'folder',
      nodeId: parent.id,
      parentFolderId: parent.parentFolderId,
      folderPath,
      fullPath,
      name: parent.name,
      isDeleted,
    })
    .onConflictDoUpdate({
      target: [
        storageNodeBtree.userId,
        storageNodeBtree.nodeType,
        storageNodeBtree.nodeId,
      ],
      set: {
        parentFolderId: parent.parentFolderId,
        folderPath,
        fullPath,
        name: parent.name,
        isDeleted,
        updatedAt: new Date(),
      },
    })
  return fullPath
}

export async function upsertFolderNode(input: {
  userId: string
  folderId: string
  name: string
  parentFolderId: string | null
  isDeleted: boolean
}) {
  const parentPath = await resolveParentPath(
    input.userId,
    input.parentFolderId,
  )
  const folderPath = normalizePath(parentPath)
  const fullPath = joinPath(folderPath, input.name)

  await db
    .insert(storageNodeBtree)
    .values({
      userId: input.userId,
      nodeType: 'folder',
      nodeId: input.folderId,
      parentFolderId: input.parentFolderId,
      folderPath,
      fullPath,
      name: input.name,
      isDeleted: input.isDeleted,
    })
    .onConflictDoUpdate({
      target: [
        storageNodeBtree.userId,
        storageNodeBtree.nodeType,
        storageNodeBtree.nodeId,
      ],
      set: {
        parentFolderId: input.parentFolderId,
        folderPath,
        fullPath,
        name: input.name,
        isDeleted: input.isDeleted,
        updatedAt: new Date(),
      },
    })
}

export async function upsertFileNode(input: UpsertFileInput) {
  const folderPath = normalizePath(
    (await getNodePath(input.userId, input.folderId)) ?? '',
  )
  const fullPath = joinPath(folderPath, input.name)

  await db
    .insert(storageNodeBtree)
    .values({
      userId: input.userId,
      nodeType: 'file',
      nodeId: input.fileId,
      parentFolderId: input.folderId,
      folderPath,
      fullPath,
      name: input.name,
      isDeleted: input.isDeleted,
      sizeInBytes: input.sizeInBytes ?? null,
      etag: input.etag ?? null,
      lastModified: input.lastModified ?? null,
    })
    .onConflictDoUpdate({
      target: [
        storageNodeBtree.userId,
        storageNodeBtree.nodeType,
        storageNodeBtree.nodeId,
      ],
      set: {
        parentFolderId: input.folderId,
        folderPath,
        fullPath,
        name: input.name,
        isDeleted: input.isDeleted,
        sizeInBytes: input.sizeInBytes ?? null,
        etag: input.etag ?? null,
        lastModified: input.lastModified ?? null,
        updatedAt: new Date(),
      },
    })
}

export async function markFolderSubtreeDeleted(
  userId: string,
  folderId: string,
  isDeleted: boolean,
) {
  const basePath = await getNodePath(userId, folderId)
  if (!basePath) return
  const prefix = descendantPrefix(basePath)

  await db
    .update(storageNodeBtree)
    .set({ isDeleted, updatedAt: new Date() })
    .where(
      prefix.length > 0
        ? and(
            eq(storageNodeBtree.userId, userId),
            or(
              eq(storageNodeBtree.fullPath, basePath),
              like(storageNodeBtree.fullPath, `${prefix}%`),
            ),
          )
        : and(
            eq(storageNodeBtree.userId, userId),
            eq(storageNodeBtree.fullPath, basePath),
          ),
    )
}

export async function deleteNodeByEntity(
  userId: string,
  nodeType: NodeType,
  nodeId: string,
) {
  await db
    .delete(storageNodeBtree)
    .where(
      and(
        eq(storageNodeBtree.userId, userId),
        eq(storageNodeBtree.nodeType, nodeType),
        eq(storageNodeBtree.nodeId, nodeId),
      ),
    )
}

export async function resolveFolderPath(
  userId: string,
  folderId: string | null,
) {
  const path = await getNodePath(userId, folderId)
  return path ?? ''
}

export type { NodeType }
