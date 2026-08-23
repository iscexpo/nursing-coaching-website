-- 0022: Capture media_files.category which existed in lib/db/schema.ts but
-- was never captured by any migration (schema/migration drift).
ALTER TABLE "media_files" ADD COLUMN IF NOT EXISTS "category" text DEFAULT 'general' NOT NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "media_files_category_idx" ON "media_files" USING btree ("category");
