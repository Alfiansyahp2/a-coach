# Athlete Health, Injury & Readiness Relational Database Schema

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-02  
**Owner:** Senior Data Architect & Backend Lead  
**Related Documents:** [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md), [ATHLETE_HEALTH_CONTEXT.md](./ATHLETE_HEALTH_CONTEXT.md)

---

## 1. Schema Overview

The health subsystem introduces seven normalized relational tables in PostgreSQL 16:
1. `athlete_profiles`: Physical baseline, weekly availability, and physiological measurements.
2. `athlete_injuries`: Structured injury history, mechanism, swelling, and evaluation status.
3. `athlete_pain_logs`: Longitudinal symptom tracking (pain during, after, 24h later, swelling, instability).
4. `athlete_training_responses`: Post-workout check-ins linked directly to Strava activities.
5. `athlete_medical_assessments`: Formal records from licensed healthcare professionals.
6. `athlete_training_readiness`: Historical readiness assessments and deterministic gate evaluations.
7. `health_audit_trail`: Immutable audit log for any health context modification.

---

## 2. Table Definitions & Constraints

### 1. `athlete_profiles`
```sql
CREATE TABLE athlete_profiles (
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
    performance_objectives TEXT,
    physiological_measurements JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_athlete_profile_user UNIQUE (user_id)
);
```

### 2. `athlete_injuries`
```sql
CREATE TABLE athlete_injuries (
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
    medical_evaluation_status VARCHAR(50) DEFAULT 'PENDING_CLINICAL_ASSESSMENT' NOT NULL,
    current_status VARCHAR(50) DEFAULT 'ACTIVE_SYMPTOMATIC' NOT NULL,
    clinician_restrictions TEXT,
    functional_limitations TEXT,
    recovery_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

### 3. `athlete_training_readiness`
```sql
CREATE TABLE athlete_training_readiness (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    evaluated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    athlete_status VARCHAR(50) NOT NULL,
    running_readiness VARCHAR(50) NOT NULL,
    cycling_readiness VARCHAR(50) NOT NULL,
    general_readiness VARCHAR(50) NOT NULL,
    running_restrictions TEXT,
    cycling_restrictions TEXT,
    rationale TEXT NOT NULL,
    trigger_symptoms JSONB DEFAULT '[]'::JSONB,
    source_telemetry_refs JSONB DEFAULT '[]'::JSONB,
    medical_clearance BOOLEAN DEFAULT FALSE NOT NULL,
    automatic_progression_allowed BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

