ALTER TABLE "dot-storage"."folder"
ADD COLUMN "virtual_bucket_id" text;
--> statement-breakpoint
CREATE UNIQUE INDEX "folder_virtualBucketId_unq" ON "dot-storage"."folder" USING btree ("virtual_bucket_id");
--> statement-breakpoint
UPDATE "dot-storage"."folder" AS f
SET "virtual_bucket_id" = vb."id"
FROM "dot-storage"."virtual_bucket" AS vb
WHERE vb."mapped_folder_id" = f."id";