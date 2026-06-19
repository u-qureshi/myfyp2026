-- Migration: Add expires_at to student_selected_timetables
-- Run this in Supabase SQL editor for existing databases

ALTER TABLE student_selected_timetables
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Backfill: set expiry for any existing rows (selected_at + 4 months)
UPDATE student_selected_timetables
  SET expires_at = selected_at + INTERVAL '4 months'
  WHERE expires_at IS NULL;
