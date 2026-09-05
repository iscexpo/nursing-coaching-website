-- 0020: Configure Shiram System SMS gateway V1.70
-- Provider: Shiram (https://smsapi.shiramsystem.com/user_api/)
-- Verified live 2026-08-21: get_balance returns {"status":true,"balance":980}
-- Portal login: iconcpi2022@gmail.com / Miraj442$ (human login, NOT API)
-- API credential: email=iconcpi2022@gmail.com, password/API-hash=e79176f8beb530985e81f858a3ce50d5 (tested)
--   Shiram get_balance fails with Miraj442$ (code 22), succeeds with hash (balance 980)
-- Mask: Non-Masking (default, change to approved mask if needed)

-- Ensure settings table has the primary row, then configure Shiram
INSERT INTO "settings" ("id", "site_name", "site_tagline", "sms_provider", "sms_api_key", "sms_sender_id", "cms_content", "content_version", "created_at", "updated_at")
VALUES (
  'primary',
  'ISC Expo - Icon Skill & Career Expo',
  'সাফল্যের জন্য প্রস্তুতি',
  'shiram',
  'e79176f8beb530985e81f858a3ce50d5',
  'Non-Masking',
  '{"smsExtras": {"smsEmail": "iconcpi2022@gmail.com", "smsPassword": "e79176f8beb530985e81f858a3ce50d5"}}'::jsonb,
  now(),
  now()
)
ON CONFLICT ("id") DO UPDATE SET
  "sms_provider" = 'shiram',
  "sms_api_key" = 'e79176f8beb530985e81f858a3ce50d5',
  "sms_sender_id" = COALESCE(NULLIF(EXCLUDED."sms_sender_id", ''), "settings"."sms_sender_id", 'Non-Masking'),
  "cms_content" = COALESCE("settings"."cms_content", '{}'::jsonb) || jsonb_build_object('smsExtras', jsonb_build_object('smsEmail', 'iconcpi2022@gmail.com', 'smsPassword', 'e79176f8beb530985e81f858a3ce50d5')),
  "updated_at" = now();
