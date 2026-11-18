-- Migration 004: Decouple strava_activity_id and introduce is_manual flag
-- Allows manual-first activities without requiring synthetic Strava IDs

-- 1. Make strava_activity_id nullable
ALTER TABLE activities
ALTER COLUMN strava_activity_id DROP NOT NULL;

-- 2. Add is_manual column to explicitly distinguish manual entries from Strava sync
ALTER TABLE activities
ADD COLUMN IF NOT EXISTS is_manual BOOLEAN DEFAULT TRUE NOT NULL;

-- 3. Create index for manual activity queries
CREATE INDEX IF NOT EXISTS idx_activities_user_manual ON activities(user_id, is_manual);

