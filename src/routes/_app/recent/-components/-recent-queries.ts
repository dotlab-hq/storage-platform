import { and, desc, eq, gte, or, sql } from 'drizzle-orm'

type RecentFolder = {
  id: string
  name: string
  createdAt: Date
  parentFolderId: string | null
  lastOpenedAt: Date | null
  isPrivatelyLocked: boolean
}

type RecentFile = {
  id: string
  name: string
  sizeInBytes: number
  mimeType: string | null
  createdAt: Date
  lastOpenedAt: Date | null
  isPrivatelyLocked: boolean
}

const NOT_IN_VIRTUAL_BUCKET_FOLDER_TREE = sql<boolean>`
  NOT EXISTS (
    WITH RECURSIVE ancestors(id, parent_folder_id) AS (
      SELECT "folder"."id", "folder"."parent_folder_id"
      UNION ALL
      SELECT parent."id", parent."parent_folder_id"
      FROM "folder" parent
      JOIN ancestors ON parent."id" = ancestors.parent_folder_id
    )
    SELECT 1
    FROM ancestors
    JOIN "virtual_bucket" vb ON vb."mapped_folder_id" = ancestors.id
    WHERE vb."is_active" = true
  )
`

const NOT_IN_VIRTUAL_BUCKET_FILE_TREE = sql<boolean>`
  NOT EXISTS (
    WITH RECURSIVE ancestors(id, parent_folder_id) AS (
      SELECT child."id", child."parent_folder_id"
      FROM "folder" child
      WHERE child."id" = "file"."folder_id"
      UNION ALL
      SELECT parent."id", parent."parent_folder_id"
      FROM "folder" parent
      JOIN ancestors ON parent."id" = ancestors.parent_folder_id
    )
    SELECT 1
    FROM ancestors
    JOIN "virtual_bucket" vb ON vb."mapped_folder_id" = ancestors.id
    WHERE vb."is_active" = true
  )
`

export async function getRecentDriveItems(
  userId: string,
): Promise<{ folders: RecentFolder[]; files: RecentFile[] }> {
  const [{ db }, { file: storageFile, folder }] = await Promise.all([
    import('@/db'),
    import('@/db/schema/storage'),
  ])

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const folderRecentAt = sql<Date>`coalesce(${folder.lastOpenedAt}, ${folder.createdAt})`
  const fileRecentAt = sql<Date>`coalesce(${storageFile.lastOpenedAt}, ${storageFile.createdAt})`

  const [folders, files] = await Promise.all([
    db
      .select({
        id: folder.id,
        name: folder.name,
        createdAt: folder.createdAt,
        parentFolderId: folder.parentFolderId,
        lastOpenedAt: folder.lastOpenedAt,
        isPrivatelyLocked: folder.isPrivatelyLocked,
      })
      .from(folder)
      .where(
        and(
          eq(folder.userId, userId),
          eq(folder.isDeleted, false),
          eq(folder.isTrashed, false),
          NOT_IN_VIRTUAL_BUCKET_FOLDER_TREE,
          or(gte(folder.lastOpenedAt, cutoff), gte(folder.createdAt, cutoff)),
        ),
      )
      .orderBy(desc(folderRecentAt))
      .limit(50),
    db
      .select({
        id: storageFile.id,
        name: storageFile.name,
        sizeInBytes: storageFile.sizeInBytes,
        mimeType: storageFile.mimeType,
        createdAt: storageFile.createdAt,
        lastOpenedAt: storageFile.lastOpenedAt,
        isPrivatelyLocked: storageFile.isPrivatelyLocked,
      })
      .from(storageFile)
      .where(
        and(
          eq(storageFile.userId, userId),
          eq(storageFile.isDeleted, false),
          eq(storageFile.isTrashed, false),
          NOT_IN_VIRTUAL_BUCKET_FILE_TREE,
          or(
            gte(storageFile.lastOpenedAt, cutoff),
            gte(storageFile.createdAt, cutoff),
          ),
        ),
      )
      .orderBy(desc(fileRecentAt))
      .limit(50),
  ])

  return { folders, files }
}
