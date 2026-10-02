-- No-op: `proxy_uploads_enabled` is already created by 0000 (base schema).
-- Adding it again failed every fresh database setup. Databases that already
-- applied this migration are unaffected (migrations are tracked by name).
SELECT 1;
