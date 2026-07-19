ALTER TABLE "admissions" ADD COLUMN IF NOT EXISTS "ssc" jsonb;
ALTER TABLE "admissions" ADD COLUMN IF NOT EXISTS "hsc" jsonb;
ALTER TABLE "admissions" ADD COLUMN IF NOT EXISTS "honors" jsonb;
