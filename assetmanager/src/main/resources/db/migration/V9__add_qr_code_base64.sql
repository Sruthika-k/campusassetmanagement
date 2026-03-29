-- Store raw PNG bytes as base64 for ephemeral / cloud filesystems
ALTER TABLE asset ADD COLUMN qr_code_base64 LONGTEXT NULL;
