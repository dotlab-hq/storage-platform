import { relations } from "drizzle-orm";
import { bigint, boolean, index, text, timestamp, type AnyPgColumn } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
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
        folderId: text( "folder_id" ).references( () => folder.id, {
            onDelete: "set null",
        } ),
        createdAt: timestamp( "created_at" ).defaultNow().notNull(),
        updatedAt: timestamp( "updated_at" )
            .defaultNow()
            .$onUpdate( () => /* @__PURE__ */ new Date() )
            .notNull(),
    },
    ( table ) => [
        index( "file_userId_idx" ).on( table.userId ),
        index( "file_folderId_idx" ).on( table.folderId ),
    ],
);

export const fileShare = schema.table(
    "file_share",
    {
        id: text( "id" )
            .$defaultFn( () => crypto.randomUUID() )
            .primaryKey(),
        fileId: text( "file_id" )
            .notNull()
            .references( () => file.id, { onDelete: "cascade" } ),
        sharedByUserId: text( "shared_by_user_id" )
            .notNull()
            .references( () => user.id, { onDelete: "cascade" } ),
        shareToken: text( "share_token" ).notNull().unique(),
        isActive: boolean( "is_active" ).default( true ).notNull(),
        expiresAt: timestamp( "expires_at" ),
        createdAt: timestamp( "created_at" ).defaultNow().notNull(),
    },
    ( table ) => [
        index( "fileShare_fileId_idx" ).on( table.fileId ),
        index( "fileShare_sharedByUserId_idx" ).on( table.sharedByUserId ),
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
    shares: many( fileShare ),
} ) );

export const fileShareRelations = relations( fileShare, ( { one } ) => ( {
    file: one( file, {
        fields: [fileShare.fileId],
        references: [file.id],
    } ),
    sharedByUser: one( user, {
        fields: [fileShare.sharedByUserId],
        references: [user.id],
    } ),
} ) );

export const userStorageRelations = relations( userStorage, ( { one } ) => ( {
    user: one( user, {
        fields: [userStorage.userId],
        references: [user.id],
    } ),
} ) );
