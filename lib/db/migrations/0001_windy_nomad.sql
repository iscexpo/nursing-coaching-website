CREATE TABLE "contact_inquiries" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"message" text NOT NULL,
	"is_resolved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exam_submissions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"exam_id" text NOT NULL,
	"score" integer NOT NULL,
	"total" integer NOT NULL,
	"answers" jsonb NOT NULL,
	"time_taken" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exams" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"subject" text NOT NULL,
	"duration" integer DEFAULT 15 NOT NULL,
	"difficulty" text DEFAULT 'medium' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notices" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text,
	"tag" text NOT NULL,
	"is_urgent" boolean DEFAULT false NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" text PRIMARY KEY NOT NULL,
	"exam_id" text NOT NULL,
	"question" text NOT NULL,
	"options" jsonb NOT NULL,
	"correct_index" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "otp" ALTER COLUMN "attempts" SET DEFAULT '{"count":0,"lastAttempt":"2026-07-11T10:44:41.472Z"}'::jsonb;--> statement-breakpoint
ALTER TABLE "exam_submissions" ADD CONSTRAINT "exam_submissions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_submissions" ADD CONSTRAINT "exam_submissions_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "contact_inquiries_created_idx" ON "contact_inquiries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "exam_submissions_user_id_idx" ON "exam_submissions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "exam_submissions_exam_id_idx" ON "exam_submissions" USING btree ("exam_id");--> statement-breakpoint
CREATE INDEX "exam_submissions_user_exam_idx" ON "exam_submissions" USING btree ("user_id","exam_id");--> statement-breakpoint
CREATE INDEX "exams_subject_idx" ON "exams" USING btree ("subject");--> statement-breakpoint
CREATE INDEX "notices_created_idx" ON "notices" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "questions_exam_id_idx" ON "questions" USING btree ("exam_id");