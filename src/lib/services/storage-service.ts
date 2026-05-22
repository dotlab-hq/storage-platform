import { BaseService, createServiceContext } from './base-service'
import { db } from '@/db'
import { folder, file, shareLink, userStorage } from '@/db/schema/storage'
import { storageNodeBtree } from '@/db/schema/storage-btree'
import { userActivity } from '@/db/schema/activity'
import { and, eq, desc, isNull, sql } from 'drizzle-orm'
import { z } from 'zod'
import { upsertFolderNode } from '@/lib/storage-btree/index'

const EXCLUDE_VIRTUAL_BUCKET_FOLDERS = sql<boolean>`
  NOT EXISTS (
    SELECT 1
    FROM "virtual_bucket" vb
    WHERE vb."mapped_folder_id" = "folder"."id"
      AND vb."is_active" = true
  )
`

export const CreateFolderSchema = z.object({
  name: z.string().min(1).max(255),
  parentFolderId: z.string().nullable().optional(),
})

export const MoveItemsSchema = z.object({
  itemIds: z.array(z.string()).min(1),
  targetFolderId: z.string().nullable(),
})

export const RenameItemSchema = z.object({
  itemId: z.string().min(1),
  name: z.string().min(1).max(255),
})

export const DeleteItemsSchema = z.object({
  itemIds: z.array(z.string()).min(1),
})

export const ListFolderItemsSchema = z.object({
  folderId: z.string().nullable().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
})

export class StorageService extends BaseService {
  // Folder operations
  async createFolder(input: z.infer<typeof CreateFolderSchema>) {
    this.assertAuthenticated()
    const { name, parentFolderId = null } = input

    // Validate parent exists and belongs to user
    if (parentFolderId) {
      const parent = await this.db.query.folder.findFirst({
        where: and(
          eq(folder.id, parentFolderId),
          eq(folder.userId, this.ctx.userId),
          eq(folder.isDeleted, false),
          isNull(folder.virtualBucketId),
        ),
      })
      if (!parent) {
        this.error('Parent folder not found or access denied', 'NOT_FOUND')
      }
    }

    // Check for duplicate name in same parent
    const existing = await this.db.query.folder.findFirst({
      where: and(
        eq(folder.name, name),
        parentFolderId === null
          ? isNull(folder.parentFolderId)
          : eq(folder.parentFolderId, parentFolderId),
        eq(folder.userId, this.ctx.userId),
        eq(folder.isDeleted, false),
        eq(folder.isTrashed, false),
        isNull(folder.virtualBucketId),
      ),
    })
    if (existing) {
      this.error('A folder with this name already exists', 'DUPLICATE_NAME')
    }

    const [newFolder] = await this.db
      .insert(folder)
      .values({
        name,
        parentFolderId,
        userId: this.ctx.userId,
      })
      .returning()

    await this.logActivity('folder.create', 'Folder', newFolder.id, {
      name: newFolder.name,
      parentFolderId,
    })

    // Insert folder itself into btree for root listing to work
    await upsertFolderNode({
      userId: this.ctx.userId,
      folderId: newFolder.id,
      name: newFolder.name,
      parentFolderId,
      isDeleted: false,
    })

    // Seed btree for fast listing of this folder's contents
    await this.seedBtreeForFolder(newFolder.id, parentFolderId)

    return newFolder
  }

  async listFolderItems(input: z.infer<typeof ListFolderItemsSchema>) {
    this.assertAuthenticated()
    const { folderId = null, page = 1, limit = 20 } = input
    const offset = (page - 1) * limit

    // Verify folder access
    if (folderId) {
      const parentFolder = await this.db.query.folder.findFirst({
        where: and(
          eq(folder.id, folderId),
          eq(folder.userId, this.ctx.userId),
          eq(folder.isDeleted, false),
          eq(folder.isTrashed, false),
          isNull(folder.virtualBucketId),
        ),
      })
      if (!parentFolder) {
        this.error('Folder not found or access denied', 'NOT_FOUND')
      }
    }

    // Use btree for efficient listing
    const parentFolderCondition =
      folderId === null
        ? isNull(storageNodeBtree.parentFolderId)
        : eq(storageNodeBtree.parentFolderId, folderId)

    const items = await this.db
      .select({
        id: storageNodeBtree.id,
        itemId: storageNodeBtree.nodeId,
        itemType: storageNodeBtree.nodeType,
        name: storageNodeBtree.name,
        parentFolderId: storageNodeBtree.parentFolderId,
        createdAt: storageNodeBtree.createdAt,
        updatedAt: storageNodeBtree.updatedAt,
        size: storageNodeBtree.sizeInBytes,
        mimeType: storageNodeBtree.etag,
      })
      .from(storageNodeBtree)
      .where(
        and(
          parentFolderCondition,
          eq(storageNodeBtree.userId, this.ctx.userId),
          eq(storageNodeBtree.isDeleted, false),
          EXCLUDE_VIRTUAL_BUCKET_FOLDERS,
        ),
      )
      .orderBy(desc(storageNodeBtree.updatedAt))
      .limit(limit)
      .offset(offset)

    const [countResult] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(storageNodeBtree)
      .where(
        and(
          parentFolderCondition,
          eq(storageNodeBtree.userId, this.ctx.userId),
          eq(storageNodeBtree.isDeleted, false),
          EXCLUDE_VIRTUAL_BUCKET_FOLDERS,
        ),
      )

    const total = Number(countResult.count || 0)

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: offset + limit < total,
        hasPrev: page > 1,
      },
    }
  }

  async moveItems(input: z.infer<typeof MoveItemsSchema>) {
    this.assertAuthenticated()
    const { itemIds, targetFolderId } = input

    // Verify target folder
    if (targetFolderId) {
      const target = await this.db.query.folder.findFirst({
        where: and(
          eq(folder.id, targetFolderId),
          eq(folder.userId, this.ctx.userId),
          eq(folder.isDeleted, false),
          eq(folder.isTrashed, false),
          isNull(folder.virtualBucketId),
        ),
      })
      if (!target) {
        this.error('Target folder not found or access denied', 'NOT_FOUND')
      }
    }

    // Verify all items exist and belong to user
    const items = await this.db.query.file.findMany({
      where: and(eq(file.userId, this.ctx.userId), eq(file.isDeleted, false)),
    })
    const itemIdsSet = new Set(items.map((i) => i.id))
    for (const id of itemIds) {
      if (!itemIdsSet.has(id)) {
        this.error(`Item ${id} not found or access denied`, 'NOT_FOUND')
      }
    }

    // Also check folders being moved
    const foldersToMove = await this.db.query.folder.findMany({
      where: and(
        eq(folder.userId, this.ctx.userId),
        eq(folder.isDeleted, false),
      ),
    })
    const folderIdsSet = new Set(foldersToMove.map((f) => f.id))

    // Prevent moving folder into itself or its descendants
    if (targetFolderId && folderIdsSet.has(targetFolderId)) {
      this.error('Cannot move folder into itself', 'INVALID_OPERATION')
    }

    const movedItems: any[] = []

    await this.db.transaction(async (tx) => {
      for (const itemId of itemIds) {
        // Check if it's a file or folder
        if (itemIdsSet.has(itemId)) {
          const [moved] = await tx
            .update(file)
            .set({ folderId: targetFolderId })
            .where(eq(file.id, itemId))
            .returning()
          movedItems.push({ ...moved, itemType: 'file' as const })
        } else if (folderIdsSet.has(itemId)) {
          const [moved] = await tx
            .update(folder)
            .set({ parentFolderId: targetFolderId })
            .where(eq(folder.id, itemId))
            .returning()
          movedItems.push({ ...moved, itemType: 'folder' as const })
        }

        // Update btree
        await tx
          .update(storageNodeBtree)
          .set({ parentFolderId: targetFolderId })
          .where(eq(storageNodeBtree.nodeId, itemId))
      }
    })

    await this.logActivity('items.move', 'Items', itemIds.join(','), {
      targetFolderId,
      count: itemIds.length,
    })

    return { movedItems }
  }

  async renameItem(input: z.infer<typeof RenameItemSchema>) {
    this.assertAuthenticated()
    const { itemId, name } = input

    // Check if file
    const fileRec = await this.db.query.file.findFirst({
      where: and(
        eq(file.id, itemId),
        eq(file.userId, this.ctx.userId),
        eq(file.isDeleted, false),
      ),
    })

    if (fileRec) {
      const [renamed] = await this.db
        .update(file)
        .set({ name, updatedAt: new Date() })
        .where(eq(file.id, itemId))
        .returning()

      await this.db
        .update(storageNodeBtree)
        .set({ name })
        .where(eq(storageNodeBtree.nodeId, itemId))

      await this.logActivity('file.rename', 'File', itemId, { name })
      return renamed
    }

    // Check if folder
    const folderRec = await this.db.query.folder.findFirst({
      where: and(
        eq(folder.id, itemId),
        eq(folder.userId, this.ctx.userId),
        eq(folder.isDeleted, false),
        eq(folder.isTrashed, false),
        isNull(folder.virtualBucketId),
      ),
    })

    if (folderRec) {
      const [renamed] = await this.db
        .update(folder)
        .set({ name, updatedAt: new Date() })
        .where(eq(folder.id, itemId))
        .returning()

      await this.db
        .update(storageNodeBtree)
        .set({ name })
        .where(eq(storageNodeBtree.nodeId, itemId))

      await this.logActivity('folder.rename', 'Folder', itemId, { name })
      return renamed
    }

    this.error('Item not found or access denied', 'NOT_FOUND')
  }

  async deleteItems(input: z.infer<typeof DeleteItemsSchema>) {
    this.assertAuthenticated()
    const { itemIds } = input

    await this.db.transaction(async (tx) => {
      for (const itemId of itemIds) {
        // Try file first
        const fileRec = await tx.query.file.findFirst({
          where: and(
            eq(file.id, itemId),
            eq(file.userId, this.ctx.userId),
            eq(file.isDeleted, false),
          ),
        })

        if (fileRec) {
          await tx
            .update(file)
            .set({ isDeleted: true, deletedAt: new Date() })
            .where(eq(file.id, itemId))

          await tx
            .update(storageNodeBtree)
            .set({ isDeleted: true })
            .where(eq(storageNodeBtree.nodeId, itemId))

          await this.logActivity('file.delete', 'File', itemId)
          continue
        }

        // Try folder
        const folderRec = await tx.query.folder.findFirst({
          where: and(
            eq(folder.id, itemId),
            eq(folder.userId, this.ctx.userId),
            eq(folder.isDeleted, false),
            isNull(folder.virtualBucketId),
          ),
        })

        if (folderRec) {
          await tx
            .update(folder)
            .set({ isDeleted: true, deletedAt: new Date() })
            .where(eq(folder.id, itemId))

          await tx
            .update(storageNodeBtree)
            .set({ isDeleted: true })
            .where(eq(storageNodeBtree.nodeId, itemId))

          await this.logActivity('folder.delete', 'Folder', itemId)
        }
      }
    })

    return { deleted: itemIds.length }
  }

  async getUserQuota() {
    this.assertAuthenticated()
    const [quota] = await this.db
      .select()
      .from(userStorage)
      .where(eq(userStorage.userId, this.ctx.userId))

    return {
      usedStorage: Number(quota.usedStorage),
      allocatedStorage: Number(quota.allocatedStorage),
      fileSizeLimit: Number(quota.fileSizeLimit),
    }
  }

  // Btree helpers
  private async seedBtreeForFolder(
    folderId: string,
    parentFolderId: string | null,
  ) {
    // Get all items in this folder for btree seeding
    const folderItems = await this.db.query.file.findMany({
      where: and(eq(file.folderId, folderId), eq(file.userId, this.ctx.userId)),
    })

    const subfolders = await this.db.query.folder.findMany({
      where: and(
        eq(folder.parentFolderId, folderId),
        eq(folder.userId, this.ctx.userId),
      ),
    })

    const btreeEntries = [
      ...folderItems.map((item) => ({
        nodeId: item.id,
        nodeType: 'file' as const,
        name: item.name,
        parentFolderId,
        userId: this.ctx.userId,
        sizeInBytes: Number(item.sizeInBytes) || 0,
        folderPath: parentFolderId || '',
        fullPath: `/${item.name}`,
      })),
      ...subfolders.map((folderRec) => ({
        nodeId: folderRec.id,
        nodeType: 'folder' as const,
        name: folderRec.name,
        parentFolderId,
        userId: this.ctx.userId,
        sizeInBytes: 0,
        folderPath: '',
        fullPath: `/${folderRec.name}`,
      })),
    ]

    if (btreeEntries.length > 0) {
      await this.db.insert(storageNodeBtree).values(btreeEntries)
    }
  }
}
