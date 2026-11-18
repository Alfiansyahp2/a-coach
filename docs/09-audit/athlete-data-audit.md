# Athlete Data Center & Adaptive Coaching Foundation: Codebase & Database Audit

**Status:** CONFIRMED & AUDITED  
**Version:** 1.0  
**Audit Date:** 2026-11-03  
**Auditor:** Principal Software Architect, Senior Database Architect & AI Systems Engineer  
**Target Repository:** `project_strava`  
**Database Connection:** PostgreSQL 16 (`sport_training`)  
**Related Documents:** [existing-database-reconciliation.md](./existing-database-reconciliation.md), [coach-data-dependency-map.md](./coach-data-dependency-map.md), [DATABASE_SCHEMA.md](../03-architecture/DATABASE_SCHEMA.md)

---

## 1. Executive Summary

This audit establishes the baseline for building the **Unified Athlete Data Center & Adaptive Multi-Sport Coaching Foundation**. The objective is to unify all athlete information—biometrics, Strava telemetry, training history, periodization schedules, clinical injury dossiers, and progressive milestone goals—into an authoritative data layer consumable by AI Running Coach, AI Cycling Coach, and the Multi-Sport Coordinator without maintaining disjointed or conflicting profiles.

In strict compliance with the **Non-Negotiable Data Preservation Directive**, this audit was conducted without modifying, dropping, truncating, or mutating any existing database records. The 34 authentic activities (24 Ride, 10 Run) and 17 existing tables remain 100% intact.

---

## 2. Answers to the 12 Mandatory Architecture Audit Questions

### 1. What athlete information is already stored?
The platform currently stores:
- **Identity & Accounts (`users`)**: Primary ID (`00000000-0000-0000-0000-000000000001`), email, display name, avatar URL, creation and update timestamps.
- **Biometrics & Physical Profile (`users` & `athlete_profiles`)**:
  - `users`: Height (170.0 cm), Weight (65.0 kg), Resting Heart Rate (68 bpm), Max Heart Rate (188 bpm).
  - `athlete_profiles`: Age (34), Height (170.0 cm), Weight (65.0 kg), BMI (22.49), Resting HR (68 bpm), Training Days/Week (3 days), Preferred Sports (`['Running', 'Cycling']`), Training Experience (`INTERMEDIATE`), Performance Objectives (`Aerobic endurance maintenance with safe multi-sport progression`).
  - `physiological_measurements` (JSONB): Structured placeholders for `lthr`, `hr_max`, `vo2_max`, `ftp_watts`, `cycling_power_zones`, `sleep_recovery_baseline`, `baseline_consistency_weeks`, `running_threshold_pace_sec`.
- **Clinical Health & Injury Registry (`athlete_injuries`, `athlete_pain_logs`, `athlete_training_responses`, `athlete_training_readiness`)**:
  - Right ankle inversion sprain history with previous 2-month swelling.
  - Bilateral patellofemoral knee ache history post-running.
  - Active sport-specific readiness permissions (Running: `ON_HOLD`, Cycling: `CONDITIONAL`).
  - Pain check-in history with severity scores (0–10 scale), onset times, and joint swelling flags.
- **Training Plans & Scheduled Workouts (`training_plans`, `scheduled_workouts`, `workout_activity_matches`)**:
  - Active 12-Week Zone 2 periodization plan container.
  - 38 scheduled workouts covering Cycling, Cross Training, and Rest Days.
  - Heuristic planned vs actual activity match records with delta variance tracking.
- **Goals & Personal Records (`fitness_goals`, `personal_records`)**:
  - 4 fitness goals including Century Ride 100 km, Marathon Pathway 42.2K, 3 Sessions/Week Consistency, and 12-Week 400 km Accumulation.
  - 3 benchmark personal records (Running 5K, 10K, and Longest Distance).

---

### 2. Which tables are the authoritative source for athlete data?
- **Athlete Identity**: `users` is the authoritative source for authentication identity and account credentials.
- **Athletic & Biometric Context**: `athlete_profiles` is the authoritative source for sports biometrics, training volume capacity, and physiological parameters. The service layer (`getAuthoritativeHealthContext`) reads from `athlete_profiles` and treats `users` columns as legacy fallback.
- **Health, Injury & Joint Safety**: `athlete_injuries` (authoritative for tissue pathology) and `athlete_training_readiness` (authoritative for real-time sport execution permissions).
- **Execution Telemetry**: `activities` is the authoritative source for authentic workout metrics.

---

### 3. What information is imported from Strava?
Imported through official Strava API v3 (`GET /athlete/activities`):
- `strava_activity_id` (Unique numeric ID for idempotent upsert).
- `name` (Activity title).
- `sport_type` (`Run`, `Ride`, `VirtualRide`, `Walk`, `Hike`, `WeightTraining`, etc.).
- `start_date` (ISO-8601 UTC timestamp).
- `distance_meters`, `moving_time_seconds`, `elapsed_time_seconds`.
- `elevation_gain_meters`.
- `average_speed_mps`, `max_speed_mps`.
- `average_heartrate`, `max_heartrate`.
- `average_cadence`.
- `average_watts` (cycling power).
- `calories`.
- `raw_summary_polyline` (Google encoded polyline string for GPS map routes).

---

### 4. What information is manually entered by athletes?
1. **Athlete Biometrics**: Height, weight, resting HR, max HR (via `EditAthleteProfileModal`).
2. **Manual Activities**: Telemetry entered manually when Strava is unavailable or for indoor workouts (via `AddActivityModal`).
3. **Screenshot Telemetry**: Image uploads parsed via OCR heuristics (via `/api/activities/parse-image`).
4. **Activity Telemetry Corrections**: Manual edits to distance, pace, moving time, and notes (via `EditActivityModal`).
5. **Injury Records**: Medical history, injury mechanism, timeframe, and clinician restrictions (via `AddInjuryModal`).
6. **Post-Activity Check-ins**: Subjective session RPE, pain before/during/after, swelling, joint stability, and comments (via `PostActivityCheckinModal`).
7. **Medical Consultations**: Diagnostic procedures, clinical findings, and therapist clearance (via `RecordMedicalProcedureModal`).
8. **Fitness Goals**: Target distance, duration, deadline, and sport type (via `/goals` hub and modal).

---

### 5. Are athlete goals already implemented?
**YES, fully implemented.**
- Stored in `fitness_goals` (columns: `title`, `goal_type`, `target_value`, `current_value`, `start_date`, `target_date`, `is_achieved`, `unit`).
- Managed through a dedicated route (`/goals`) featuring the **Progressive Milestone Chaining Engine**:
  - Automatically identifies when the First 100 km Century Ride is conquered.
  - Automatically unlocks Tier 2 & 3 targets (+100 km accumulation, Gran Fondo 150 km, 1,000 m D+ climbing, 200 km Double Century).
  - Includes an interactive simulation tester switch and custom target creator.

---

### 6. Is training availability already implemented?
**PARTIALLY IMPLEMENTED.**
- `athlete_profiles.training_days_per_week` stores a simple integer (e.g., `3`).
- `coachTrainingGenerator.ts` generates workouts on fixed days (Tuesday, Friday, Sunday).
- **Missing**: Granular day-by-day availability (e.g. `['Tuesday', 'Friday', 'Sunday']`), preferred time of day (Morning/Evening), maximum duration caps per day (e.g. 60 min weekday vs 180 min weekend), fasting schedules (Ramadan or Intermittent Fasting), and protected rest days.

---

### 7. Does the application already track injuries or pain?
**YES, fully implemented with clinical-grade taxonomy.**
- `athlete_injuries` tracks pathology, body region, side (Left/Right/Bilateral), timeline, evaluation status, and clinician restrictions.
- `athlete_pain_logs` tracks 0–10 severity scores, onset time (during, immediate, 24h post), joint instability, and swelling flags.
- `anatomyUtils.ts` enforces a 16-structure anatomical taxonomy covering the ankle complex, knee patellofemoral joint, Achilles tendon, plantar fascia, hamstring, hip, and lumbar spine.

---

### 8. Does the application already have recovery or readiness metrics?
**YES, implemented via deterministic rules-based evaluation.**
- `athlete_training_readiness` stores computed software readiness states:
  - Running: `ON_HOLD` (high-impact loading prohibited).
  - Cycling: `CONDITIONAL` (low-impact seated spinning permitted $\le$ 30 km, 85–95 RPM).
- `readinessEngine.ts` computes these permissions deterministically from injury status, pain check-in scores, and clinical restrictions.
- `ai-coach.ts` evaluates Acute:Chronic Workload Ratio (ACWR) and 10% weekly volume overload spikes.

---

### 9. Do Running Coach and Cycling Coach share the same athlete context?
**YES.**
Both modules consume the centralized service `getAuthoritativeHealthContext()` from `src/lib/db/healthRepo.ts`. The Biomechanical Safety Gate in `AthleteHealthDeck` and `ScheduleTrainingHub` applies this unified context to both sports, preventing contradictory prescriptions.

---

### 10. Are there duplicate or conflicting data sources?
**YES, 4 minor data duplications were identified:**
1. **Biometrics Overlap**: `users` (`height_cm`, `weight_kg`, `resting_heart_rate`, `max_heart_rate`) vs `athlete_profiles` (same fields + `bmi`, `age`, `physiological_measurements`).
2. **Post-Activity Check-in Overlap**: `athlete_pain_logs` (clinical pain severity & joint swelling) vs `athlete_training_responses` (session RPE & general fatigue).
3. **Distance Unit Inconsistency**: `activities.distance_meters` (meters) vs `athlete_training_responses.distance_km` (kilometers).
4. **Goal State Fallback**: `fitness_goals` in PostgreSQL vs `.data/store.json` in local store fallback.

---

### 11. Which existing API endpoints and services can be reused?
- **Repository Services**:
  - `src/lib/db/activityRepo.ts` (Full activity CRUD & pagination).
  - `src/lib/db/healthRepo.ts` (Profile, injury, pain log, medical procedure, readiness persistence).
  - `src/lib/db/goalRepo.ts` (Goals & PR retrieval and upsert).
  - `src/lib/db/trainingRepo.ts` (Workouts, periodization plans, matches).
- **Domain Engines**:
  - `src/lib/readinessEngine.ts` (Deterministic sport-specific readiness validation).
  - `src/lib/coachTrainingGenerator.ts` (12-Week Zone 2 periodization generator).
  - `src/lib/matching.ts` (Heuristic planned vs actual workout matching).
  - `src/lib/streakEngine.ts` (Thermodynamic flame streak calculation).
- **API Endpoints**:
  - `/api/athlete/health-context`
  - `/api/athlete/profile`
  - `/api/athlete/injuries`
  - `/api/athlete/checkin`
  - `/api/athlete/medical-procedure`
  - `/api/activities` & `/api/activities/[id]`
  - `/api/activities/parse-image`
  - `/api/training/generate`
  - `/api/auth/strava/*` & `/api/strava/sync`

---

### 12. What information is missing to support adaptive coaching?
To reach the full vision of adaptive multi-sport coaching, the following data domains are currently missing or unmodeled:
1. **Granular Weekly Availability & Schedule Constraints**: Explicit preferred training days, per-session duration limits, and fasting windows.
2. **Equipment & Shoe/Bike Registry**: Shoe mileage tracker (injury prevention for worn foam), bike specifications (MTB vs Road vs Indoor Trainer).
3. **Daily Morning Recovery / Wellness Check-in**: Pre-training subjective score (sleep quality, perceived recovery, systemic life stress, general muscle soreness) before heading out to train.
4. **Structured Multi-Sport Load Coordination Engine**: Cross-training load translation rules (e.g. converting a missed 5 km run into an equivalent 15 km low-impact cycling session to preserve aerobic volume).
5. **Structured Medical Restriction Representation**: Machine-readable restriction parameters (e.g. `max_impact_g`, `max_heart_rate_bpm`, `prohibited_cadence_range`) beyond free-text notes.

---

## 3. Current PostgreSQL Schema Inventory (17 Tables)

```text
Table Name                      Rows    Primary Responsibility
-----------------------------------------------------------------------------------------
users                           1       Core identity root, account metadata, legacy biometrics
strava_connections              0       Strava OAuth athlete binding & active scopes
strava_tokens                   0       AES-256-GCM encrypted access and refresh tokens
activities                      34      Authoritative multi-sport activities (24 Ride, 10 Run)
training_plans                  1       12-Week Zone 2 periodization plan container
scheduled_workouts              38      Prescribed training sessions with target telemetry
workout_activity_matches        2       Heuristic linkage between scheduled and actual sessions
fitness_goals                   4       Macro milestone goals (Century Ride, Marathon, etc.)
personal_records                3       Multi-sport personal bests with activity linkage
sync_logs                       4       Audit trail for Strava synchronization runs
athlete_profiles                1       Authoritative athletic biometrics & physiological state
athlete_injuries                2       Clinical injury registry & pathology tracking
athlete_pain_logs               2       Longitudinal post-activity pain check-ins
athlete_training_responses      1       Post-session RPE and exertion response telemetry
athlete_medical_assessments     0       Clinical consultations & medical imaging reports
athlete_training_readiness      1       Deterministic sport-specific readiness permissions
health_audit_trail              3       Security and medical audit logs for sensitive changes
-----------------------------------------------------------------------------------------
Total Verified Tables:          17 Tables (34 Authentic Activities Preserved)
```

