-- Drop all indexes that might conflict with drizzle-kit push
-- Run this in your D1 console first, then run pnpm drizzle-kit push

-- From 0000 migration
DROP INDEX IF EXISTS `account_userId_idx`;
DROP INDEX IF EXISTS `session_token_unique`;
DROP INDEX IF EXISTS `session_userId_idx`;
DROP INDEX IF EXISTS `twoFactor_secret_idx`;
DROP INDEX IF EXISTS `twoFactor_userId_idx`;
DROP INDEX IF EXISTS `user_email_unique`;
DROP INDEX IF EXISTS `verification_identifier_idx`;
DROP INDEX IF EXISTS `uploadAttempt_userId_idx`;
DROP INDEX IF EXISTS `uploadAttempt_bucketId_idx`;
DROP INDEX IF EXISTS `uploadAttempt_status_idx`;
DROP INDEX IF EXISTS `uploadAttempt_providerId_idx`;
DROP INDEX IF EXISTS `virtualBucket_userId_name_unq`;
DROP INDEX IF EXISTS `virtualBucket_userId_idx`;
DROP INDEX IF EXISTS `virtualBucket_mappedFolderId_idx`;
DROP INDEX IF EXISTS `storage_provider_name_unique`;
DROP INDEX IF EXISTS `storageProvider_isActive_idx`;
DROP INDEX IF EXISTS `file_userId_idx`;
DROP INDEX IF EXISTS `file_providerId_idx`;
DROP INDEX IF EXISTS `file_folderId_idx`;
DROP INDEX IF EXISTS `folder_virtual_bucket_id_unique`;
DROP INDEX IF EXISTS `folder_userId_idx`;
DROP INDEX IF EXISTS `folder_parentFolderId_idx`;
DROP INDEX IF EXISTS `share_link_share_token_unique`;
DROP INDEX IF EXISTS `shareLink_fileId_idx`;
DROP INDEX IF EXISTS `shareLink_folderId_idx`;
DROP INDEX IF EXISTS `shareLink_sharedByUserId_idx`;
DROP INDEX IF EXISTS `userStorage_userId_idx`;

-- From 0001 migration  
DROP INDEX IF EXISTS `qr_login_offer_code_unique`;
DROP INDEX IF EXISTS `qrLoginOffer_ownerUserId_idx`;
DROP INDEX IF EXISTS `qrLoginOffer_status_idx`;
DROP INDEX IF EXISTS `qrLoginOffer_expiresAt_idx`;
DROP INDEX IF EXISTS `tiny_session_token_unique`;
DROP INDEX IF EXISTS `tinySession_userId_idx`;
DROP INDEX IF EXISTS `tinySession_expiresAt_idx`;
DROP INDEX IF EXISTS `tinySession_revokedAt_idx`;

-- From 0004 migration
DROP INDEX IF EXISTS `qr_login_offer_poll_key_unique`;

-- From 0005 migration (device_transfer was dropped in 0006, so skip)

-- Success message
SELECT 'All indexes dropped. You can now run: pnpm drizzle-kit push' as message;
