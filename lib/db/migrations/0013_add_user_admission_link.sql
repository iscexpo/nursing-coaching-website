ALTER TABLE "user" ADD COLUMN "admission_id" text REFERENCES "admissions"("id") ON DELETE SET NULL;
