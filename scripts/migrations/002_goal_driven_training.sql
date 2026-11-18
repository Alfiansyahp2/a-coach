-- Migration 002: Goal-Driven Training Engine & Dynamic Periodization
-- Non-destructive extension linking training_plans to fitness_goals and adding weekly milestone indicators.

-- 1. Add goal_id to training_plans
ALTER TABLE training_plans 
ADD COLUMN IF NOT EXISTS goal_id UUID REFERENCES fitness_goals(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_training_plans_goal_id ON training_plans(goal_id);

-- 2. Add is_key_session and milestone_target_km to scheduled_workouts
ALTER TABLE scheduled_workouts
ADD COLUMN IF NOT EXISTS is_key_session BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN IF NOT EXISTS milestone_target_km NUMERIC(10, 2);

CREATE INDEX IF NOT EXISTS idx_workouts_key_session ON scheduled_workouts(is_key_session);

