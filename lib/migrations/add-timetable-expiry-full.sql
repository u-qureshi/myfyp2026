-- Timetable expiry: options expires_at + expired request status
-- Usage: node scripts/add-timetable-expiry.mjs

ALTER TABLE student_timetable_options
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

UPDATE student_timetable_options
  SET expires_at = created_at + INTERVAL '4 months'
  WHERE expires_at IS NULL;

DO $$ BEGIN
  ALTER TYPE constraint_request_status ADD VALUE IF NOT EXISTS 'expired';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
