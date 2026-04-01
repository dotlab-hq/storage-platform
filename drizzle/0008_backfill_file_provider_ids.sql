WITH preferred_provider AS (
	SELECT sp.id
	FROM "dot-storage"."storage_provider" sp
	WHERE sp.is_active = true
	ORDER BY
		CASE
			WHEN lower(sp.name) = 'default provider' THEN 0
			WHEN lower(sp.name) = 'main' THEN 1
			ELSE 2
		END,
		sp.created_at ASC,
		sp.id ASC
	LIMIT 1
)
UPDATE "dot-storage"."file" f
SET "provider_id" = pp.id
FROM preferred_provider pp
WHERE f."provider_id" IS NULL;