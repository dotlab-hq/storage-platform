import { relations, sql } from "drizzle-orm";
import { bigint, boolean, index, text, timestamp, check } from "drizzle-orm/pg-core";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { storageProvider } from "./storage-provider";
import { schema } from "./schema";

const DEFAULT_ALLOCATED_STORAGE_BYTES = 250 * 1024 * 1024;
const DEFAULT_FILE_SIZE_LIMIT_BYTES = 10 * 1024 * 1024;

export const folder = schema.table(
    "folder",
    {
        id: text( "id" )
            .$defaultFn( () => crypto.randomUUID() )
            .primaryKey(),
        name: text( "name" ).notNull(),
        userId: text( "user_id" )
            .notNull()
            .references( () => user.id, { onDelete: "cascade" } ),
        parentFolderId: text( "parent_folder_id" ).references( (): AnyPgColumn => folder.id, {
            onDelete: "set null",
        } ),
        isPrivatelyLocked: boolean( "is_privately_locked" ).default( false ).notNull(),
        isDeleted: boolean( "is_deleted" ).default( false ).notNull(),
        deletedAt: timestamp( "deleted_at" ),
        lastOpenedAt: timestamp( "last_opened_at" ),
        createdAt: timestamp( "created_at" ).defaultNow().notNull(),
        updatedAt: timestamp( "updated_at" )
            .defaultNow()
            .$onUpdate( () => /* @__PURE__ */ new Date() )
            .notNull(),
    },
    ( table ) => [
        index( "folder_userId_idx" ).on( table.userId ),
        index( "folder_parentFolderId_idx" ).on( table.parentFolderId ),
    ],
);

export const file = schema.table(
    "file",
    {
        id: text( "id" )
            .$defaultFn( () => crypto.randomUUID() )
            .primaryKey(),
        name: text( "name" ).notNull(),
        objectKey: text( "object_key" ).notNull(),
        mimeType: text( "mime_type" ),
        sizeInBytes: bigint( "size_in_bytes", { mode: "number" } ).notNull(),
        userId: text( "user_id" )
            .notNull()
            .references( () => user.id, { onDelete: "cascade" } ),
        providerId: text( "provider_id" ).references( () => storageProvider.id, {
            onDelete: "set null",
        } ),
        folderId: text( "folder_id" ).references( () => folder.id, {
            onDelete: "set null",
        } ),
        isPrivatelyLocked: boolean( "is_privately_locked" ).default( false ).notNull(),
        isDeleted: boolean( "is_deleted" ).default( false ).notNull(),
        deletedAt: timestamp( "deleted_at" ),
        lastOpenedAt: timestamp( "last_opened_at" ),
        createdAt: timestamp( "created_at" ).defaultNow().notNull(),
        updatedAt: timestamp( "updated_at" )
            .defaultNow()
            .$onUpdate( () => /* @__PURE__ */ new Date() )
            .notNull(),
    },
    ( table ) => [
        index( "file_userId_idx" ).on( table.userId ),
        index( "file_providerId_idx" ).on( table.providerId ),
        index( "file_folderId_idx" ).on( table.folderId ),
    ],
);

export const shareLink = schema.table(
    "share_link",
    {
        id: text( "id" )
            .$defaultFn( () => crypto.randomUUID() )
            .primaryKey(),
        fileId: text( "file_id" )
            .references( () => file.id, { onDelete: "cascade" } ),
        folderId: text( "folder_id" )
            .references( () => folder.id, { onDelete: "cascade" } ),
        sharedByUserId: text( "shared_by_user_id" )
            .notNull()
            .references( () => user.id, { onDelete: "cascade" } ),
        shareToken: text( "share_token" ).notNull().unique(),
        requiresAuth: boolean( "requires_auth" ).default( false ).notNull(),
        consentedPrivatelyUnlock: boolean( "consented_privately_unlock" ).default( false ).notNull(),
        isActive: boolean( "is_active" ).default( true ).notNull(),
        expiresAt: timestamp( "expires_at" ),
        createdAt: timestamp( "created_at" ).defaultNow().notNull(),
    },
    ( table ) => [
        index( "shareLink_fileId_idx" ).on( table.fileId ),
        index( "shareLink_folderId_idx" ).on( table.folderId ),
        index( "shareLink_sharedByUserId_idx" ).on( table.sharedByUserId ),
        check( "share_link_target_check", sql`("file_id" IS NOT NULL AND "folder_id" IS NULL) OR ("file_id" IS NULL AND "folder_id" IS NOT NULL)` ),
    ],
);

export const userStorage = schema.table(
    "user_storage",
    {
        userId: text( "user_id" )
            .primaryKey()
            .references( () => user.id, { onDelete: "cascade" } ),
        allocatedStorage: bigint( "allocated_storage", { mode: "number" } )
            .default( DEFAULT_ALLOCATED_STORAGE_BYTES )
            .notNull(),
        fileSizeLimit: bigint( "file_size_limit", { mode: "number" } )
            .default( DEFAULT_FILE_SIZE_LIMIT_BYTES )
            .notNull(),
        usedStorage: bigint( "used_storage", { mode: "number" } ).default( 0 ).notNull(),
        createdAt: timestamp( "created_at" ).defaultNow().notNull(),
        updatedAt: timestamp( "updated_at" )
            .defaultNow()
            .$onUpdate( () => /* @__PURE__ */ new Date() )
            .notNull(),
    },
    ( table ) => [index( "userStorage_userId_idx" ).on( table.userId )],
);

export const folderRelations = relations( folder, ( { one, many } ) => ( {
    owner: one( user, {
        fields: [folder.userId],
        references: [user.id],
    } ),
    parentFolder: one( folder, {
        fields: [folder.parentFolderId],
        references: [folder.id],
        relationName: "folderParent",
    } ),
    childFolders: many( folder, {
        relationName: "folderParent",
    } ),
    files: many( file ),
    shareLinks: many( shareLink ),
} ) );

export const fileRelations = relations( file, ( { one, many } ) => ( {
    owner: one( user, {
        fields: [file.userId],
        references: [user.id],
    } ),
    folder: one( folder, {
        fields: [file.folderId],
        references: [folder.id],
    } ),
    shares: many( shareLink ),
} ) );

export const shareLinkRelations = relations( shareLink, ( { one } ) => ( {
    file: one( file, {
        fields: [shareLink.fileId],
        references: [file.id],
    } ),
    folder: one( folder, {
        fields: [shareLink.folderId],
        references: [folder.id],
    } ),
    sharedByUser: one( user, {
        fields: [shareLink.sharedByUserId],
        references: [user.id],
    } ),
} ) );

export const userStorageRelations = relations( userStorage, ( { one } ) => ( {
    user: one( user, {
        fields: [userStorage.userId],
        references: [user.id],
    } ),
} ) );
