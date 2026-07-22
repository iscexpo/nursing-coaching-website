-- Phase 3A: Enrollment lifecycle columns
ALTER TABLE enrollments ADD COLUMN approved_at timestamp;
ALTER TABLE enrollments ADD COLUMN started_at timestamp;
ALTER TABLE enrollments ADD COLUMN completed_at timestamp;
ALTER TABLE enrollments ADD COLUMN expires_at timestamp;
ALTER TABLE enrollments ADD COLUMN suspended_reason text;
ALTER TABLE enrollments ADD COLUMN completion_percentage integer DEFAULT 0;
