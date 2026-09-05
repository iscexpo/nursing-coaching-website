-- Phase 3E: Notification templates
CREATE TABLE IF NOT EXISTS "notification_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"channel" text DEFAULT 'in_app' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "notification_templates_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notification_templates_is_active_idx" ON "notification_templates" USING btree ("is_active");
--> statement-breakpoint

-- Phase 3E: Scheduled notifications
CREATE TABLE IF NOT EXISTS "scheduled_notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"template_id" text,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" text DEFAULT 'info' NOT NULL,
	"scheduled_at" timestamp NOT NULL,
	"target_role" text,
	"target_course_id" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "scheduled_notifications_scheduled_at_idx" ON "scheduled_notifications" USING btree ("scheduled_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "scheduled_notifications_status_idx" ON "scheduled_notifications" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "scheduled_notifications_template_id_idx" ON "scheduled_notifications" USING btree ("template_id");
--> statement-breakpoint

-- Phase 5A: Session activity tracking (last_active_at)
ALTER TABLE session ADD COLUMN last_active_at timestamp;
--> statement-breakpoint

-- Phase 3D/0018: Leave requests
CREATE TABLE IF NOT EXISTS "leave_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"course_id" text NOT NULL,
	"date" date NOT NULL,
	"reason" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"approved_by" text,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "leave_requests_student_id_idx" ON "leave_requests" USING btree ("student_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "leave_requests_course_id_idx" ON "leave_requests" USING btree ("course_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "leave_requests_status_idx" ON "leave_requests" USING btree ("status");