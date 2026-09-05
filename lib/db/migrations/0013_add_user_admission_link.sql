ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "admission_id" text REFERENCES "admissions"("id") ON DELETE SET NULL;
