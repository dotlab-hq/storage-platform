UPDATE "dot-storage"."folder" AS f
SET "virtual_bucket_id" = vb."id"
FROM "dot-storage"."virtual_bucket" AS vb
WHERE vb."mapped_folder_id" = f."id"
  AND f."virtual_bucket_id" IS NULL;