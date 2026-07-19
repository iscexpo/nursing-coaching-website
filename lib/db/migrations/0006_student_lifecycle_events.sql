CREATE TABLE IF NOT EXISTS "student_lifecycle_events" (
  "id" text PRIMARY KEY,
  "student_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "enrollment_id" text REFERENCES "enrollments"("id") ON DELETE SET NULL,
  "event_type" text NOT NULL,
  "details" jsonb NOT NULL DEFAULT '{}',
  "created_at" timestamp NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "student_lifecycle_events_student_id_idx" ON "student_lifecycle_events" ("student_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "student_lifecycle_events_enrollment_id_idx" ON "student_lifecycle_events" ("enrollment_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "student_lifecycle_events_created_at_idx" ON "student_lifecycle_events" ("created_at");
