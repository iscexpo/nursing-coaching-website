-- Phase 3C: Exam enhancements
ALTER TABLE exams ADD COLUMN exam_type text DEFAULT 'model_test';
ALTER TABLE exams ADD COLUMN start_time timestamp;
ALTER TABLE exams ADD COLUMN end_time timestamp;
ALTER TABLE exams ADD COLUMN allow_review boolean DEFAULT true;
ALTER TABLE exams ADD COLUMN negative_marking boolean DEFAULT false;
ALTER TABLE exams ADD COLUMN shuffle_questions boolean DEFAULT true;
ALTER TABLE exams ADD COLUMN shuffle_options boolean DEFAULT true;

-- Phase 3C: Question enhancements
ALTER TABLE questions ADD COLUMN difficulty text DEFAULT 'medium';
ALTER TABLE questions ADD COLUMN points integer DEFAULT 1;
ALTER TABLE questions ADD COLUMN explanation text;
