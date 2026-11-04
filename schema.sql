-- =====================================================================
-- DATABASE SCHEMA: ATHLETE PERFORMANCE & STRAVA TRAINING PLATFORM
-- Normalized PostgreSQL Schema with UUID Primary Keys & Full Constraints
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    weight_kg NUMERIC(5, 2) DEFAULT 65.0,
    height_cm NUMERIC(5, 1) DEFAULT 170.0,
    resting_heart_rate INTEGER DEFAULT 68,
    max_heart_rate INTEGER DEFAULT 188,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. STRAVA CONNECTIONS & SECURE TOKENS
CREATE TABLE IF NOT EXISTS strava_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    strava_athlete_id BIGINT UNIQUE NOT NULL,
    athlete_name VARCHAR(255),
    athlete_username VARCHAR(255),
    avatar_url TEXT,
    scopes TEXT[] NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_user_strava UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS strava_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID NOT NULL REFERENCES strava_connections(id) ON DELETE CASCADE,
    access_token_encrypted TEXT NOT NULL,
    refresh_token_encrypted TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_connection_token UNIQUE (connection_id)
);

-- 3. ACTIVITIES (Ingested from Strava API v3)
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    strava_activity_id BIGINT UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    sport_type VARCHAR(50) NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    distance_meters NUMERIC(10, 2) NOT NULL,
    moving_time_seconds INTEGER NOT NULL,
    elapsed_time_seconds INTEGER NOT NULL,
    elevation_gain_meters NUMERIC(8, 2) DEFAULT 0,
    average_speed_mps NUMERIC(6, 3),
    max_speed_mps NUMERIC(6, 3),
    average_heartrate NUMERIC(5, 1),
    max_heartrate NUMERIC(5, 1),
    average_cadence NUMERIC(5, 1),
    average_watts NUMERIC(6, 1),
    calories NUMERIC(8, 2),
    raw_summary_polyline TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_activities_user_date ON activities(user_id, start_date DESC);
CREATE INDEX IF NOT EXISTS idx_activities_sport ON activities(user_id, sport_type);

-- 4. TRAINING PLANS & SCHEDULED WORKOUTS
CREATE TABLE IF NOT EXISTS training_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_id UUID REFERENCES fitness_goals(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS scheduled_workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES training_plans(id) ON DELETE SET NULL,
    scheduled_date DATE NOT NULL,
    workout_category VARCHAR(50) NOT NULL,
    target_distance_meters NUMERIC(10, 2),
    target_duration_seconds INTEGER,
    target_pace_seconds_per_km INTEGER,
    target_intensity VARCHAR(50),
    description TEXT,
    status VARCHAR(20) DEFAULT 'PLANNED' NOT NULL,
    is_key_session BOOLEAN DEFAULT FALSE NOT NULL,
    milestone_target_km NUMERIC(10, 2),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON scheduled_workouts(user_id, scheduled_date);

-- 5. WORKOUT & ACTIVITY MATCHING (Planned vs Actual)
CREATE TABLE IF NOT EXISTS workout_activity_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_id UUID NOT NULL REFERENCES scheduled_workouts(id) ON DELETE CASCADE,
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    is_manual_match BOOLEAN DEFAULT FALSE NOT NULL,
    completion_percentage NUMERIC(6, 2) NOT NULL,
    distance_delta_meters NUMERIC(10, 2),
    duration_delta_seconds INTEGER,
    pace_delta_seconds_per_km INTEGER,
    matched_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_workout_match UNIQUE (workout_id),
    CONSTRAINT uq_activity_match UNIQUE (activity_id)
);

-- 6. FITNESS GOALS & PERSONAL RECORDS
CREATE TABLE IF NOT EXISTS fitness_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    goal_type VARCHAR(50) NOT NULL,
    target_value NUMERIC(12, 2) NOT NULL,
    current_value NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    start_date DATE NOT NULL,
    target_date DATE NOT NULL,
    is_achieved BOOLEAN DEFAULT FALSE NOT NULL,
    unit VARCHAR(30) NOT NULL,
    sport_type VARCHAR(30) DEFAULT 'Ride',
    priority INTEGER DEFAULT 1,
    target_event_name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS personal_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
    sport_type VARCHAR(20) DEFAULT 'Run',
    category VARCHAR(50) NOT NULL,
    record_value NUMERIC(12, 2) NOT NULL,
    record_display VARCHAR(50) NOT NULL,
    achieved_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_user_pr_category UNIQUE (user_id, category)
);

-- 7. AUDIT & SYNC LOGS
CREATE TABLE IF NOT EXISTS sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL,
    activities_fetched INTEGER DEFAULT 0,
    activities_created INTEGER DEFAULT 0,
    activities_updated INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ
);

-- =====================================================================
-- 8. ATHLETE HEALTH PROFILES & PHYSIOLOGICAL BASELINE
-- =====================================================================
CREATE TABLE IF NOT EXISTS athlete_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    age INTEGER CHECK (age > 0 AND age < 120),
    height_cm NUMERIC(5, 1) CHECK (height_cm > 50 AND height_cm < 260),
    weight_kg NUMERIC(5, 2) CHECK (weight_kg > 20 AND weight_kg < 300),
    bmi NUMERIC(4, 1) GENERATED ALWAYS AS (ROUND(weight_kg / ((height_cm / 100.0) * (height_cm / 100.0)), 1)) STORED,
    resting_heart_rate INTEGER CHECK (resting_heart_rate > 30 AND resting_heart_rate < 150),
    training_days_per_week INTEGER CHECK (training_days_per_week >= 1 AND training_days_per_week <= 7),
    preferred_sports TEXT[] DEFAULT ARRAY['Running', 'Cycling']::TEXT[],
    training_experience VARCHAR(50) DEFAULT 'INTERMEDIATE',
    performance_objectives TEXT DEFAULT 'Aerobic endurance maintenance with safe multi-sport progression',
    physiological_measurements JSONB DEFAULT '{
        "hr_max": null,
        "lthr": null,
        "ftp_watts": null,
        "vo2_max": null,
        "running_threshold_pace_sec": null,
        "cycling_power_zones": null,
        "baseline_consistency_weeks": null,
        "sleep_recovery_baseline": null
    }'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_athlete_profile_user UNIQUE (user_id)
);

-- =====================================================================
-- 9. ATHLETE INJURY HISTORY
-- =====================================================================
CREATE TABLE IF NOT EXISTS athlete_injuries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body_region VARCHAR(50) NOT NULL,
    side VARCHAR(20) NOT NULL CHECK (side IN ('LEFT', 'RIGHT', 'BILATERAL', 'AXIAL')),
    injury_mechanism TEXT NOT NULL,
    timeframe_description VARCHAR(100) NOT NULL,
    estimated_injury_date DATE,
    previous_symptoms TEXT,
    initial_severity VARCHAR(30) DEFAULT 'MODERATE',
    previous_swelling BOOLEAN DEFAULT FALSE,
    previous_swelling_duration VARCHAR(100),
    medical_evaluation_status VARCHAR(50) DEFAULT 'PENDING_CLINICAL_ASSESSMENT' NOT NULL
        CHECK (medical_evaluation_status IN (
            'PENDING_CLINICAL_ASSESSMENT',
            'CLINICALLY_ASSESSED',
            'UNDER_TREATMENT',
            'DISCHARGED_CLEARED'
        )),
    current_status VARCHAR(50) DEFAULT 'ACTIVE_SYMPTOMATIC' NOT NULL
        CHECK (current_status IN (
            'ACTIVE_SYMPTOMATIC',
            'ASYMPTOMATIC_RECOVERING',
            'RECURRENT',
            'RESOLVED',
            'CHRONIC'
        )),
    clinician_restrictions TEXT,
    functional_limitations TEXT,
    recovery_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_athlete_injuries_user ON athlete_injuries(user_id, current_status);

-- =====================================================================
-- 10. ATHLETE PAIN LOGS (Longitudinal Symptom Tracking)
-- =====================================================================
CREATE TABLE IF NOT EXISTS athlete_pain_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    injury_id UUID REFERENCES athlete_injuries(id) ON DELETE SET NULL,
    body_region VARCHAR(50) NOT NULL,
    side VARCHAR(20) NOT NULL CHECK (side IN ('LEFT', 'RIGHT', 'BILATERAL', 'AXIAL')),
    pain_score INTEGER CHECK (pain_score >= 0 AND pain_score <= 10),
    pain_type VARCHAR(50),
    associated_activity VARCHAR(50),
    pain_during_activity INTEGER CHECK (pain_during_activity >= 0 AND pain_during_activity <= 10),
    pain_immediately_after INTEGER CHECK (pain_immediately_after >= 0 AND pain_immediately_after <= 10),
    pain_24h_after INTEGER CHECK (pain_24h_after >= 0 AND pain_24h_after <= 10),
    swelling_present BOOLEAN DEFAULT FALSE,
    joint_instability BOOLEAN DEFAULT FALSE,
    functional_limitations TEXT,
    logged_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_athlete_pain_logs_user_date ON athlete_pain_logs(user_id, logged_at DESC);

-- =====================================================================
-- 11. ATHLETE TRAINING RESPONSES (Post-Activity Check-in)
-- =====================================================================
CREATE TABLE IF NOT EXISTS athlete_training_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
    strava_activity_id BIGINT,
    sport_type VARCHAR(50) NOT NULL,
    distance_km NUMERIC(6, 2) NOT NULL,
    duration_seconds INTEGER NOT NULL,
    rpe_score NUMERIC(3, 1) CHECK (rpe_score >= 1.0 AND rpe_score <= 10.0),
    pain_during_activity INTEGER CHECK (pain_during_activity >= 0 AND pain_during_activity <= 10),
    pain_after_activity INTEGER CHECK (pain_after_activity >= 0 AND pain_after_activity <= 10),
    pain_next_day INTEGER CHECK (pain_next_day >= 0 AND pain_next_day <= 10),
    swelling_observed BOOLEAN DEFAULT FALSE,
    instability_observed BOOLEAN DEFAULT FALSE,
    fatigue_response VARCHAR(30) DEFAULT 'NORMAL' CHECK (fatigue_response IN ('LOW', 'NORMAL', 'HIGH', 'EXHAUSTED')),
    athlete_comments TEXT,
    pain_log_id UUID REFERENCES athlete_pain_logs(id) ON DELETE SET NULL,
    checkin_completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_activity_response UNIQUE (user_id, activity_id)
);

CREATE INDEX IF NOT EXISTS idx_athlete_responses_user ON athlete_training_responses(user_id, created_at DESC);

-- =====================================================================
-- 12. ATHLETE MEDICAL ASSESSMENTS
-- =====================================================================
CREATE TABLE IF NOT EXISTS athlete_medical_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    injury_id UUID REFERENCES athlete_injuries(id) ON DELETE SET NULL,
    assessment_date DATE NOT NULL,
    healthcare_provider_type VARCHAR(100) NOT NULL,
    provider_name VARCHAR(255),
    clinical_findings TEXT NOT NULL,
    confirmed_diagnosis TEXT,
    imaging_summary TEXT,
    clinician_restrictions TEXT NOT NULL,
    rehabilitation_protocol TEXT,
    return_to_sport_criteria TEXT,
    follow_up_date DATE,
    verification_status VARCHAR(50) DEFAULT 'ATHLETE_ENTERED' NOT NULL
        CHECK (verification_status IN ('ATHLETE_ENTERED', 'CLINICIAN_VERIFIED', 'AUDITED')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_medical_assessments_user ON athlete_medical_assessments(user_id, assessment_date DESC);

-- =====================================================================
-- 13. ATHLETE TRAINING READINESS
-- =====================================================================
CREATE TABLE IF NOT EXISTS athlete_training_readiness (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    evaluated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    athlete_status VARCHAR(50) NOT NULL
        CHECK (athlete_status IN (
            'OPTIMAL_CLEAR',
            'ACTIVE_WITH_UNRESOLVED_SYMPTOMS',
            'UNDER_ACTIVE_REHAB',
            'SUSPENDED_MEDICAL_EVAL_REQUIRED'
        )),
    running_readiness VARCHAR(50) NOT NULL
        CHECK (running_readiness IN (
            'READY',
            'CONDITIONAL',
            'ON_HOLD',
            'REQUIRES_CLINICAL_REVIEW',
            'RESTRICTED_BY_CLINICIAN',
            'UNKNOWN'
        )),
    cycling_readiness VARCHAR(50) NOT NULL
        CHECK (cycling_readiness IN (
            'READY',
            'CONDITIONAL',
            'ON_HOLD',
            'REQUIRES_CLINICAL_REVIEW',
            'RESTRICTED_BY_CLINICIAN',
            'UNKNOWN'
        )),
    general_readiness VARCHAR(50) NOT NULL
        CHECK (general_readiness IN (
            'READY',
            'CONDITIONAL',
            'ON_HOLD',
            'REQUIRES_CLINICAL_REVIEW',
            'RESTRICTED_BY_CLINICIAN',
            'UNKNOWN'
        )),
    running_restrictions TEXT,
    cycling_restrictions TEXT,
    rationale TEXT NOT NULL,
    trigger_symptoms JSONB DEFAULT '[]'::JSONB,
    source_telemetry_refs JSONB DEFAULT '[]'::JSONB,
    medical_clearance BOOLEAN DEFAULT FALSE NOT NULL,
    automatic_progression_allowed BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_readiness_user_eval ON athlete_training_readiness(user_id, evaluated_at DESC);

-- =====================================================================
-- 14. HEALTH AUDIT TRAIL
-- =====================================================================
CREATE TABLE IF NOT EXISTS health_audit_trail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'OVERRIDE')),
    state_before JSONB,
    state_after JSONB,
    modified_by VARCHAR(100) DEFAULT 'ATHLETE' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_health_audit_user ON health_audit_trail(user_id, created_at DESC);

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
