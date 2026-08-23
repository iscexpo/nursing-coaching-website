CREATE TABLE IF NOT EXISTS "admissions" (
  "id" text PRIMARY KEY,
  "reference" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "phone" text NOT NULL,
  "course_id" text NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
  "message" text,
  "status" text NOT NULL DEFAULT 'pending',
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admissions_phone_idx" ON "admissions" ("phone");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admissions_course_id_idx" ON "admissions" ("course_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admissions_created_idx" ON "admissions" ("created_at");
