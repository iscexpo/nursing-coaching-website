ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "village" text;
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "post" text;
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "police_station" text;
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "district" text;
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "ssc" jsonb;
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "hsc" jsonb;
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "honors" jsonb;
