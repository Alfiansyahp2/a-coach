const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'schema.sql');
let content = fs.readFileSync(schemaPath, 'utf8');

// Normalize line endings to LF for clean string matching
const isCRLF = content.includes('\r\n');
if (isCRLF) {
  content = content.replace(/\r\n/g, '\n');
}

// 1. Update fitness_goals
const oldGoals = `    unit VARCHAR(30) NOT NULL,\n    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,`;
const newGoals = `    unit VARCHAR(30) NOT NULL,\n    sport_type VARCHAR(30) DEFAULT 'Ride',\n    priority INTEGER DEFAULT 1,\n    target_event_name VARCHAR(255),\n    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,`;
content = content.replace(oldGoals, newGoals);

// 2. Update athlete_training_responses
const oldResponses = `    athlete_comments TEXT,\n    checkin_completed_at TIMESTAMPTZ,`;
const newResponses = `    athlete_comments TEXT,\n    pain_log_id UUID REFERENCES athlete_pain_logs(id) ON DELETE SET NULL,\n    checkin_completed_at TIMESTAMPTZ,`;
content = content.replace(oldResponses, newResponses);

// 3. Add Sections 15, 16, 17
const additionalSections = `
-- =====================================================================
-- 15. ATHLETE TRAINING AVAILABILITY & LIFESTYLE
-- =====================================================================
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

-- =====================================================================
-- 16. ATHLETE EQUIPMENT REGISTRY (Shoes & Bikes)
-- =====================================================================
CREATE TABLE IF NOT EXISTS athlete_equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sport_type VARCHAR(30) NOT NULL, -- 'Run', 'Ride', 'CrossTraining'
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    accumulated_distance_meters NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    max_recommended_distance_meters NUMERIC(12, 2) DEFAULT 800000 NOT NULL, -- 800 km default cap
    gear_type VARCHAR(50) DEFAULT 'RUNNING_SHOES' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_retired BOOLEAN DEFAULT FALSE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_equipment_user_sport ON athlete_equipment(user_id, sport_type);

-- =====================================================================
-- 17. ATHLETE DAILY MORNING WELLNESS
-- =====================================================================
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
`;

content += additionalSections;

if (isCRLF) {
  content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync(schemaPath, content, 'utf8');
console.log('schema.sql successfully updated to include all 20 unified entities.');

