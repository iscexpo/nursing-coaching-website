CREATE TABLE IF NOT EXISTS "model_test_applicants" (
  "id" text PRIMARY KEY,
  "reference" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "phone" text NOT NULL,
  "exam_id" text REFERENCES "exams"("id") ON DELETE SET NULL,
  "preferred_subject" text,
  "message" text,
  "status" text NOT NULL DEFAULT 'pending',
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "model_test_applicants_phone_idx" ON "model_test_applicants" ("phone");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "model_test_applicants_created_idx" ON "model_test_applicants" ("created_at");
