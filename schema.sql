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
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS personal_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
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
