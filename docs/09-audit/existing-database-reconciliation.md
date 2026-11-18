# Existing Database Reconciliation & Entity Mapping

**Status:** CONFIRMED & AUDITED  
**Version:** 1.0  
**Audit Date:** 2026-11-03  
**Auditor:** Principal Database Architect & Senior Backend Engineer  
**Scope:** PostgreSQL 16 Live Schema (`sport_training`) vs Proposed Athlete Data Center  
**Related Documents:** [athlete-data-audit.md](./athlete-data-audit.md), [coach-data-dependency-map.md](./coach-data-dependency-map.md)

---

## 1. Reconciliation Principles & Architectural Rule

In strict accordance with the **Master Mission Directive**:
1. **Reuse Before Extending**: If an equivalent entity exists, reuse it.
2. **Extend Before Creating**: If an entity needs more fields, add optional/defaulted columns or JSONB extensions.
3. **Never Duplicate**: Do not introduce parallel tables for data already managed by existing modules.
4. **Zero-Mutation Guarantee**: Never truncate, delete, or alter existing tables (`activities` with 34 rows, `users`, `athlete_injuries`, etc. must remain untouched).

---

## 2. Master Entity Reconciliation Table

| Proposed Architectural Entity | Existing Database Table | Classification | Current Status & Recommended Action |
| :--- | :--- | :--- | :--- |
| **Athlete Account & Identity** | `users` | `EXISTS_AND_REUSABLE` | **Reuse directly.** Contains immutable `id` UUID, `email`, `name`, and timestamps. |
| **Athlete Biometrics & Zones** | `athlete_profiles` | `EXISTS_NEEDS_EXTENSION` | **Reuse and extend.** Contains height, weight, BMI, resting HR, experience, and JSONB `physiological_measurements`. Can be extended to store age, weight history, and sport preference weights. |
| **Athlete Biometrics (Legacy)**| `users.weight_kg`, etc. | `DUPLICATED_OR_OVERLAPPING` | **Consolidate reads onto `athlete_profiles`.** Keep columns in `users` for backwards compatibility; treat `athlete_profiles` as authoritative. |
| **Strava Connection & Tokens** | `strava_connections`, `strava_tokens` | `EXISTS_AND_REUSABLE` | **Reuse directly.** Production-ready with AES-256-GCM encryption and multi-tenant isolation. |
| **Raw Training Activities** | `activities` | `EXISTS_AND_REUSABLE` | **Reuse directly.** 34 authentic activities stored. Preserves Strava IDs, pace, speed, elevation, and polyline. |
| **Training Periodization Plans**| `training_plans` | `EXISTS_AND_REUSABLE` | **Reuse directly.** Currently houses 12-Week Zone 2 periodization container. |
| **Prescribed Workouts** | `scheduled_workouts` | `EXISTS_AND_REUSABLE` | **Reuse directly.** 38 sessions prescribed with target duration, distance, pace, and status. |
| **Planned vs Actual Matches** | `workout_activity_matches` | `EXISTS_AND_REUSABLE` | **Reuse directly.** Computes delta variances ($Delta d, Delta t, Delta p$) and completion percentages. |
| **Fitness Goals & Milestones** | `fitness_goals` | `EXISTS_NEEDS_EXTENSION` | **Reuse and extend.** 4 goals active with progressive milestone chaining. Extend with priority (1–3), target event name, and target pace. |
| **Personal Records (PRs)** | `personal_records` | `EXISTS_AND_REUSABLE` | **Reuse directly.** 3 PRs active with activity linkage. Evaluates 8 multi-sport categories deterministically. |
| **Clinical Injury Registry** | `athlete_injuries` | `EXISTS_AND_REUSABLE` | **Reuse directly.** 2 active clinical records (right ankle sprain, knee patellofemoral ache) with 16-structure anatomical taxonomy. |
| **Post-Activity Pain Logs** | `athlete_pain_logs` | `EXISTS_AND_REUSABLE` | **Reuse directly.** 2 logs recorded with 0–10 severity, onset timing, and swelling flags. |
| **Post-Session Training Feedback**| `athlete_training_responses` | `EXISTS_AND_REUSABLE` | **Reuse directly.** Records session RPE, fatigue response, and athlete subjective comments. |
| **Medical Assessments** | `athlete_medical_assessments`| `EXISTS_AND_REUSABLE` | **Reuse directly.** Ready for physician notes, imaging summaries, and formal clearance records. |
| **Sport-Specific Training Readiness**| `athlete_training_readiness` | `EXISTS_AND_REUSABLE` | **Reuse directly.** Stores computed permissions (Run: `ON_HOLD`, Bike: `CONDITIONAL`) and rationale. |
| **Health Audit Trail** | `health_audit_trail` | `EXISTS_AND_REUSABLE` | **Reuse directly.** 3 immutable logs tracking biometric and medical modifications. |
| **Training Availability & Lifestyle**| *(Implicit in generator)* | `PARTIALLY_IMPLEMENTED` | **Propose non-destructive extension.** Currently stored only as `training_days_per_week` int. Day-of-week preferences, fasting windows, and session duration caps are hardcoded. Can be added as a dedicated table `athlete_availability` or JSONB in `athlete_profiles`. |
| **Equipment & Gear Registry** | *(None)* | `MISSING` | **Propose new entity `athlete_equipment`.** Needed for shoe mileage (injury prevention) and bike type context (MTB vs Road vs Indoor). Non-blocking; can be introduced in later phase. |
| **Daily Morning Wellness Check-in**| *(None)* | `MISSING` | **Propose new entity `athlete_daily_wellness`.** To capture morning resting HR, sleep quality, systemic fatigue, and muscle soreness before training. Distinct from post-activity pain check-ins. |
| **Multi-Sport Coordination Rules**| *(None)* | `MISSING` | **Domain service logic.** Coordinate combined volume and cross-training substitutions without requiring new database entities. |

---

## 3. Domain-by-Domain Detailed Reconciliation

### Domain A: Athlete Profile & Biometrics
- **Existing Implementation**:
  - `users` (table): Holds `weight_kg`, `height_cm`, `resting_heart_rate`, `max_heart_rate`.
  - `athlete_profiles` (table): Holds `age`, `height_cm`, `weight_kg`, `bmi`, `resting_heart_rate`, `training_days_per_week`, `preferred_sports`, `training_experience`, `performance_objectives`, `physiological_measurements`.
- **Reconciliation Strategy**:
  - **No new profile table.**
  - Treat `athlete_profiles` as the single authoritative source for athletic biometrics.
  - When athlete updates weight/height via `/api/athlete/profile`, update `athlete_profiles` and synchronize `users` for backwards compatibility.

---

### Domain B: Athlete Goals
- **Existing Implementation**:
  - `fitness_goals` (table): `title`, `goal_type`, `target_value`, `current_value`, `start_date`, `target_date`, `is_achieved`, `unit`.
  - `/goals` UI route: Supports Progressive Milestone Chaining (auto-unlocking next-tier cycling goals).
- **Reconciliation Strategy**:
  - **No new goals table.**
  - Existing model supports multi-sport goals cleanly.
  - Optional extension in future: Add `priority: integer (1-3)`, `target_sport: varchar`, `event_name: varchar` to support race preparation milestones.

---

### Domain C: Training Availability & Lifestyle
- **Existing Implementation**:
  - `athlete_profiles.training_days_per_week`: Integer representing weekly session target.
  - `coachTrainingGenerator.ts`: Fixed distribution on Tuesday, Friday, Sunday.
- **Reconciliation Strategy**:
  - Currently `PARTIALLY_IMPLEMENTED`.
  - **Proposed Non-Destructive Addition**: Create an `athlete_availability` table (or JSONB field `availability_profile` in `athlete_profiles`) to store:
    - `preferred_days: string[]` (e.g. `['Tuesday', 'Friday', 'Sunday']`)
    - `max_session_duration_minutes: integer`
    - `fasting_schedule: jsonb` (e.g. `{ type: 'INTERMITTENT', eating_window_start: '12:00' }`)
    - `protected_rest_days: string[]`

---

### Domain D: Training History & Performance
- **Existing Implementation**:
  - `activities` (table): 34 authentic Strava activities.
  - `sync_logs` (table): 4 synchronization audit runs.
  - `personal_records` (table): 3 benchmark PRs.
- **Reconciliation Strategy**:
  - **Zero structural changes required.**
  - The Strava pipeline is complete, idempotent, and preserves original telemetry without data loss.

---

### Domain E: Athlete Health & Injury Profile
- **Existing Implementation**:
  - `athlete_injuries` (table): Tracks acute/chronic injuries with 16 anatomical locations.
  - `athlete_pain_logs` (table): Longitudinal pain ratings and swelling.
  - `athlete_medical_assessments` (table): Clinical evaluations.
  - `health_audit_trail` (table): Security audit trail.
- **Reconciliation Strategy**:
  - **100% reusable.**
  - Architecture conforms completely to sports medicine protocols. Clinician restrictions override automated AI progression.

---

### Domain F: Recovery & Daily Readiness
- **Existing Implementation**:
  - `athlete_training_readiness` (table): Evaluates sport-specific readiness (`running_readiness`: `ON_HOLD`, `cycling_readiness`: `CONDITIONAL`).
  - `src/lib/readinessEngine.ts`: Evaluates permissions deterministically based on clinical gate.
- **Reconciliation Strategy**:
  - **Readiness engine is already centralized and authoritative.**
  - **Missing**: Morning wellness check-in (distinct from post-session check-in). Can be captured via a future lightweight `athlete_daily_wellness` table.

---

### Domain G: Equipment & Environment
- **Existing Implementation**:
  - None currently modeled in database.
- **Reconciliation Strategy**:
  - `MISSING` but non-blocking for current MVP.
  - Can be added cleanly as `athlete_equipment` (`id`, `user_id`, `sport_type`, `brand_model`, `accumulated_distance_meters`, `is_retired`, `notes`).

---

### Domain H: Post-Training Feedback
- **Existing Implementation**:
  - `athlete_training_responses` (table): `rpe_score`, `pain_during_activity`, `pain_after_activity`, `pain_next_day`, `swelling_observed`, `fatigue_response`, `athlete_comments`.
  - Session Load formula: $\text{Session Load} = \text{Duration (min)} \times \text{RPE}$.
- **Reconciliation Strategy**:
  - **Fully implemented and directly reusable.**
  - The existing `/api/athlete/checkin` route writes to both `athlete_pain_logs` and `athlete_training_responses`.

---

## 4. Minimum Required Schema Changes (Summary)

To avoid breaking working functionality, **no tables need to be dropped or renamed**.

1. **Immediate Action (Phase 1 Audit)**:
   - **ZERO MIGRATIONS.**
   - Preserve all 17 existing tables and 34 authentic activity rows.
2. **Phase 2 (Centralized Athlete Context Service)**:
   - Build a unified TypeScript aggregator (`src/lib/athleteContextService.ts`) that reads from existing `users`, `athlete_profiles`, `activities`, `athlete_injuries`, `athlete_training_readiness`, `fitness_goals`, and `scheduled_workouts`.
3. **Phase 3 (Additive Extensions Only)**:
   - Introduce `athlete_availability` (for day-by-day availability & fasting).
   - Introduce `athlete_equipment` (for shoe mileage & bike context).
   - Introduce `athlete_daily_wellness` (for morning readiness scores).

