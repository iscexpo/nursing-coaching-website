CREATE TABLE IF NOT EXISTS "media_files" (
  "id" text PRIMARY KEY,
  "filename" text NOT NULL,
  "original_filename" text NOT NULL,
  "url" text NOT NULL,
  "content_type" text NOT NULL,
  "size" integer NOT NULL,
  "alt_text" text,
  "description" text,
  "uploaded_by" text REFERENCES "user"("id") ON DELETE SET NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "media_files_uploaded_by_idx" ON "media_files" ("uploaded_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "media_files_created_idx" ON "media_files" ("created_at");
