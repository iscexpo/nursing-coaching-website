ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "sms_email" text DEFAULT '';
ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "sms_password" text DEFAULT '';
