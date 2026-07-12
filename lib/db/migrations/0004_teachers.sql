CREATE TABLE IF NOT EXISTS "teachers" (
  "id" text PRIMARY KEY,
  "name" text NOT NULL,
  "email" text,
  "phone" text,
  "designation" text,
  "subject" text,
  "bio" text,
  "image" text,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "teachers_is_active_idx" ON "teachers" ("is_active");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "teachers_subject_idx" ON "teachers" ("subject");
