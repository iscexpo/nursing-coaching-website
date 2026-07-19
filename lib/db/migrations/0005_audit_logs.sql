CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" text PRIMARY KEY,
  "actor_id" text REFERENCES "user"("id") ON DELETE SET NULL,
  "actor_email" text,
  "actor_role" text,
  "resource_type" text NOT NULL,
  "resource_id" text,
  "action" text NOT NULL,
  "details" jsonb NOT NULL DEFAULT '{}',
  "ip_address" text,
  "created_at" timestamp NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_logs_actor_id_idx" ON "audit_logs" ("actor_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_logs_resource_idx" ON "audit_logs" ("resource_type", "resource_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_logs_created_at_idx" ON "audit_logs" ("created_at");
