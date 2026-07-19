CREATE TABLE IF NOT EXISTS "attendance" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"date" timestamp NOT NULL,
	"status" text NOT NULL,
	"time" text,
	"marked_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "admit_cards" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"exam_id" text NOT NULL,
	"exam_name" text NOT NULL,
	"exam_date" text NOT NULL,
	"exam_time" text NOT NULL,
	"center" text NOT NULL,
	"seat_number" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contact_inquiries" ADD COLUMN IF NOT EXISTS "resolved_at" timestamp;
--> statement-breakpoint
ALTER TABLE "contact_inquiries" ADD COLUMN IF NOT EXISTS "resolved_by" text;
--> statement-breakpoint
ALTER TABLE "contact_inquiries" ADD COLUMN IF NOT EXISTS "response" text;
--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "read_at" timestamp;
--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "user_id" text;
--> statement-breakpoint
ALTER TABLE "notices" ADD COLUMN IF NOT EXISTS "author_id" text;
--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_marked_by_user_id_fk" FOREIGN KEY ("marked_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "admit_cards" ADD CONSTRAINT "admit_cards_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "admit_cards" ADD CONSTRAINT "admit_cards_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "attendance_user_id_idx" ON "attendance" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "attendance_date_idx" ON "attendance" USING btree ("date");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "attendance_user_date_idx" ON "attendance" USING btree ("user_id","date");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "attendance_user_date_unique" ON "attendance" USING btree ("user_id","date");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admit_cards_user_id_idx" ON "admit_cards" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admit_cards_exam_id_idx" ON "admit_cards" USING btree ("exam_id");
