-- =========================================================================
-- MIGRATION 001: UNIFIED ATHLETE DATA CENTER & ADAPTIVE COACHING FOUNDATION
-- Purpose: Introduce athlete availability, equipment registry, daily morning
--          wellness tracking, and clean structured goals extensions.
-- Safety: Non-destructive, idempotent, zero data loss on existing tables.
-- =========================================================================

-- 1. ATHLETE TRAINING AVAILABILITY & LIFESTYLE
CREATE TABLE IF NOT EXISTS athlete_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    preferred_days TEXT[] DEFAULT ARRAY['Tuesday', 'Friday', 'Sunday'] NOT NULL,
    preferred_time_of_day VARCHAR(30) DEFAULT 'MORNING' NOT NULL, -- 'MORNING', 'EVENING', 'FLEXIBLE'
    max_session_duration_minutes INTEGER DEFAULT 60 NOT NULL,
    weekend_duration_minutes INTEGER DEFAULT 120 NOT NULL,
    fasting_schedule JSONB DEFAULT '{"type": "NONE", "is_fasting": false}'::jsonb NOT NULL,
    protected_rest_days TEXT[] DEFAULT ARRAY['Monday'] NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_athlete_availability_user UNIQUE (user_id)
);

-- 2. ATHLETE EQUIPMENT REGISTRY (SHOE RETIREMENT & BIKE CONTEXT)
CREATE TABLE IF NOT EXISTS athlete_equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sport_type VARCHAR(30) NOT NULL, -- 'Run', 'Ride', 'CrossTraining'
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    accumulated_distance_meters NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    max_recommended_distance_meters NUMERIC(12, 2) DEFAULT 800000 NOT NULL, -- 800 km default retirement cap
    gear_type VARCHAR(50) DEFAULT 'RUNNING_SHOES' NOT NULL, -- 'RUNNING_SHOES', 'MTB', 'ROAD_BIKE', 'GRAVEL_BIKE'
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_retired BOOLEAN DEFAULT FALSE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_equipment_user_sport ON athlete_equipment(user_id, sport_type);

-- 3. ATHLETE DAILY MORNING WELLNESS & PROACTIVE RECOVERY
CREATE TABLE IF NOT EXISTS athlete_daily_wellness (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    logged_date DATE DEFAULT CURRENT_DATE NOT NULL,
    resting_heart_rate INTEGER,
    sleep_duration_hours NUMERIC(4, 2),
    sleep_quality_score INTEGER CHECK (sleep_quality_score BETWEEN 1 AND 5),
    fatigue_score INTEGER CHECK (fatigue_score BETWEEN 1 AND 5),
    muscle_soreness_score INTEGER CHECK (muscle_soreness_score BETWEEN 1 AND 5),
    life_stress_score INTEGER CHECK (life_stress_score BETWEEN 1 AND 5),
    perceived_readiness VARCHAR(30) DEFAULT 'NORMAL' NOT NULL, -- 'OPTIMAL', 'NORMAL', 'REDUCED', 'REST_RECOMMENDED'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_daily_wellness_user_date UNIQUE (user_id, logged_date)
);
CREATE INDEX IF NOT EXISTS idx_wellness_user_date ON athlete_daily_wellness(user_id, logged_date DESC);

-- 4. STRUCTURED GOALS EXTENSIONS (STOP STRING MATCHING HACKS)
ALTER TABLE fitness_goals ADD COLUMN IF NOT EXISTS sport_type VARCHAR(30) DEFAULT 'Ride';
ALTER TABLE fitness_goals ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 1;
ALTER TABLE fitness_goals ADD COLUMN IF NOT EXISTS target_event_name VARCHAR(255) NULL;

-- 5. RELATIONAL LINK BETWEEN TRAINING RESPONSES AND PAIN LOGS
ALTER TABLE athlete_training_responses ADD COLUMN IF NOT EXISTS pain_log_id UUID REFERENCES athlete_pain_logs(id) ON DELETE SET NULL;

