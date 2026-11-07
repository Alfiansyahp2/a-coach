-- Migration 003: Dedicated Primary Goal (Target Utama) Logic
-- Adds is_primary column and initializes the primary goal flag

ALTER TABLE fitness_goals
ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT FALSE NOT NULL;

-- Set is_primary = TRUE for goals with priority = 1, ensuring only 1 is primary per user
UPDATE fitness_goals
SET is_primary = CASE WHEN priority = 1 THEN TRUE ELSE FALSE END;

CREATE INDEX IF NOT EXISTS idx_fitness_goals_primary ON fitness_goals(user_id, is_primary);

