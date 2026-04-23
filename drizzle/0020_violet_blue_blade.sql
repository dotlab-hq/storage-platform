CREATE TABLE IF NOT EXISTS `storage_node_btree` (
    `id` text PRIMARY KEY NOT NULL,
    `user_id` text NOT NULL,
    `node_type` text NOT NULL,
    `node_id` text NOT NULL,
    `parent_folder_id` text,
    `folder_path` text NOT NULL,
    `full_path` text NOT NULL,
    `name` text NOT NULL,
    `is_deleted` integer DEFAULT false NOT NULL,
    `size_in_bytes` integer,
    `etag` text,
    `last_modified` integer,
    `created_at` integer NOT NULL,
    `updated_at` integer NOT NULL,
    FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `storageNodeBtree_user_node_unq` ON `storage_node_btree` (
    `user_id`,
    `node_type`,
    `node_id`
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `storageNodeBtree_user_folder_idx` ON `storage_node_btree` (
    `user_id`,
    `folder_path`,
    `is_deleted`,
    `node_type`,
    `name`
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `storageNodeBtree_user_fullPath_idx` ON `storage_node_btree` (
    `user_id`,
    `full_path`,
    `is_deleted`
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `storageNodeBtree_user_parent_idx` ON `storage_node_btree` (
    `user_id`,
    `parent_folder_id`,
    `node_type`,
    `is_deleted`
);