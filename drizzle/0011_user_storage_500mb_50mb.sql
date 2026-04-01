WITH usage_by_user AS (
    SELECT
        f.user_id,
        COALESCE(SUM(f.size_in_bytes), 0)::bigint AS used_storage
    FROM "dot-storage"."file" f
    WHERE f.is_deleted = false
    GROUP BY f.user_id
)
INSERT INTO "dot-storage"."user_storage" (
    user_id,
    allocated_storage,
    file_size_limit,
    used_storage
)
SELECT
    u.id,
    524288000,
    52428800,
    COALESCE(uby.used_storage, 0)
FROM "dot-storage"."user" u
LEFT JOIN usage_by_user uby ON u.id = uby.user_id
ON CONFLICT (user_id) DO NOTHING;

UPDATE "dot-storage"."user_storage" us
SET
    allocated_storage = 524288000,
    file_size_limit = 52428800,
    used_storage = COALESCE(uby.used_storage, 0)
FROM (
    SELECT
        f.user_id,
        COALESCE(SUM(f.size_in_bytes), 0)::bigint AS used_storage
    FROM "dot-storage"."file" f
    WHERE f.is_deleted = false
    GROUP BY f.user_id
) uby
WHERE us.user_id = uby.user_id;

UPDATE "dot-storage"."user_storage" us
SET
    allocated_storage = 524288000,
    file_size_limit = 52428800,
    used_storage = 0
WHERE NOT EXISTS (
    SELECT 1
    FROM "dot-storage"."file" f
    WHERE f.user_id = us.user_id
      AND f.is_deleted = false
);