-- 0019: Course ratings
CREATE TABLE IF NOT EXISTS "course_ratings" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"course_id" text NOT NULL,
	"rating" integer NOT NULL,
	"review" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "course_ratings_course_id_idx" ON "course_ratings" USING btree ("course_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "course_ratings_student_id_idx" ON "course_ratings" USING btree ("student_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "course_ratings_student_course_unique" ON "course_ratings" USING btree ("student_id","course_id");

-- 0019: CMS content versioning on settings
ALTER TABLE settings ADD COLUMN content_version integer DEFAULT 1 NOT NULL;
--> statement-breakpoint
ALTER TABLE settings ADD COLUMN content_draft jsonb;
--> statement-breakpoint
ALTER TABLE settings ADD COLUMN published_at timestamp;