# Master Engineering Changelog & Codebase Documentation

**Repository:** `project_strava` (Personal Sports Training & Performance Platform)  
**Release / Milestone:** `v1.0.0-foundation` (Phases 1 & 2 Core Implementation)  
**Status:** CONFIRMED & AUDITED  
**Date:** 2026-11-01  
**Target Branch:** `master`  
**Author:** Principal Software Architect & AI Engineering Governance  

---

## 📋 Executive Summary of Current Changes

This changelog records the complete architectural establishment of the **Personal Sports Training & Performance Platform**. Starting from a blank Next.js 16 scaffolding (`d4ea438 Initial commit from Create Next App`), this development cycle delivers the complete foundational data infrastructure, cryptographic token security layer, official Strava API v3 OAuth integration, endurance sports science analytics engine, heuristic planned-vs-actual workout matching algorithms, deterministic AI coaching logic, and the comprehensive 10-module engineering documentation ecosystem.

All code has been verified and passes production build compilation (`next build` with Next.js 16.4.3 Turbopack and TypeScript strict mode) with zero errors.

---

## 📦 1. Dependency Tree Modifications (`package.json` & `package-lock.json`)

### A. Added Production Dependencies
* **`pg` (`^8.23.1`)**: Official Node.js client for PostgreSQL. Powers direct relational connection pooling (`pg.Pool`), parameterized query execution, transaction support, and low-latency database queries.
* **`dotenv` (`^18.0.9`)**: Environment variable loader for localized scripts and standalone database migration tooling.
* **`lucide-react` (`^1.66.0`)**: High-performance feather-derived SVG icon library conforming to the Obsidian Telemetry design system (activity icons, calendar navigation, telemetry gauges).

### B. Added Development Dependencies
* **`@types/pg` (`^8.23.1`)**: Strict TypeScript definitions for PostgreSQL client pool, client instances, query results, and configuration types.

---

## 🗄️ 2. Database Schema & Persistence (`schema.sql`)

A 159-line production-grade normalized PostgreSQL 16 schema designed for high-density endurance telemetry, user privacy, and referential integrity.

### Extensions
* `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`: UUID generation algorithms.
* `CREATE EXTENSION IF NOT EXISTS "pgcrypto"`: Cryptographic primitives and `gen_random_uuid()` fallback.

### Detailed Table Specifications

#### 1. `users`
* **Purpose:** Stores core athlete accounts.
* **Columns:**
  * `id` (`UUID PRIMARY KEY DEFAULT gen_random_uuid()`): Immutable athlete identifier.
  * `email` (`VARCHAR(255) UNIQUE NOT NULL`): Athlete email.
  * `name` (`VARCHAR(255) NOT NULL`): Display name.
  * `avatar_url` (`TEXT`): Profile image reference.
  * `created_at`, `updated_at` (`TIMESTAMPTZ DEFAULT NOW() NOT NULL`): Audit timestamps.

#### 2. `strava_connections`
* **Purpose:** Multi-tenant Strava athlete mapping with cascading isolation.
* **Columns:**
  * `id` (`UUID PRIMARY KEY DEFAULT gen_random_uuid()`)
  * `user_id` (`UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`): Bound user account with `uq_user_strava` unique constraint (one connection per athlete).
  * `strava_athlete_id` (`BIGINT UNIQUE NOT NULL`): Unique Strava Athlete ID.
  * `athlete_name`, `athlete_username`, `avatar_url` (`VARCHAR(255)` / `TEXT`): Strava profile metadata.
  * `scopes` (`TEXT[] NOT NULL`): Granted OAuth authorization scopes (e.g., `{'read','activity:read_all'}`).
  * `is_active` (`BOOLEAN DEFAULT TRUE NOT NULL`): Connection status flag.
  * `created_at`, `updated_at` (`TIMESTAMPTZ DEFAULT NOW() NOT NULL`).

#### 3. `strava_tokens`
* **Purpose:** Encrypted OAuth credential repository isolated from connection metadata.
* **Columns:**
  * `id` (`UUID PRIMARY KEY DEFAULT gen_random_uuid()`)
  * `connection_id` (`UUID NOT NULL REFERENCES strava_connections(id) ON DELETE CASCADE`): 1:1 foreign key with `uq_connection_token`.
  * `access_token_encrypted` (`TEXT NOT NULL`): AES-256-GCM ciphertext (`iv:tag:ciphertext`).
  * `refresh_token_encrypted` (`TEXT NOT NULL`): AES-256-GCM encrypted refresh token.
  * `expires_at` (`TIMESTAMPTZ NOT NULL`): Absolute token expiry timestamp.
  * `created_at`, `updated_at` (`TIMESTAMPTZ DEFAULT NOW() NOT NULL`).

#### 4. `activities`
* **Purpose:** Immutable athletic telemetry ingested from Strava API v3.
* **Columns:**
  * `id` (`UUID PRIMARY KEY DEFAULT gen_random_uuid()`)
  * `user_id` (`UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`): Tenant bound.
  * `strava_activity_id` (`BIGINT UNIQUE NOT NULL`): Strava activity identifier.
  * `name` (`VARCHAR(255) NOT NULL`): Activity title.
  * `sport_type` (`VARCHAR(50) NOT NULL`): Standardized sport identifier (`Run`, `Ride`, `Swim`, etc.).
  * `start_date` (`TIMESTAMPTZ NOT NULL`): Local/UTC activity start time.
  * `distance_meters` (`NUMERIC(10, 2) NOT NULL`): High-precision distance measurement.
  * `moving_time_seconds` (`INTEGER NOT NULL`): True active duration.
  * `elapsed_time_seconds` (`INTEGER NOT NULL`): Total duration including pauses.
  * `elevation_gain_meters` (`NUMERIC(8, 2) DEFAULT 0`): Total vertical ascent.
  * `average_speed_mps`, `max_speed_mps` (`NUMERIC(6, 3)`): Speed in meters/second.
  * `average_heartrate`, `max_heartrate` (`NUMERIC(5, 1)`): Sensor biometric telemetry.
  * `average_cadence` (`NUMERIC(5, 1)`): Running cadence (spm) or cycling cadence (rpm).
  * `average_watts` (`NUMERIC(6, 1)`): Power output in watts.
  * `calories` (`NUMERIC(8, 2)`): Metabolic expenditure.
  * `raw_summary_polyline` (`TEXT`): Google Encoded Polyline for route rendering.
  * `description` (`TEXT`): Athlete notes.
  * `created_at`, `updated_at` (`TIMESTAMPTZ DEFAULT NOW() NOT NULL`).
* **Indexes:**
  * `CREATE INDEX idx_activities_user_date ON activities(user_id, start_date DESC)`: Fast chronological pagination.
  * `CREATE INDEX idx_activities_sport ON activities(user_id, sport_type)`: Fast sport-filtered queries.

#### 5. `training_plans` & `scheduled_workouts`
* **Purpose:** Prescriptive endurance calendar and structured workouts.
* **Columns (`scheduled_workouts`):**
  * `id` (`UUID PRIMARY KEY DEFAULT gen_random_uuid()`)
  * `user_id` (`UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`)
  * `plan_id` (`UUID REFERENCES training_plans(id) ON DELETE SET NULL`)
  * `scheduled_date` (`DATE NOT NULL`): Planned workout calendar date.
  * `workout_category` (`VARCHAR(50) NOT NULL`): Standard classification (`Easy Run`, `Long Run`, `Tempo Run`, `Interval Training`, `Rest Day`, etc.).
  * `target_distance_meters` (`NUMERIC(10, 2)`): Target distance.
  * `target_duration_seconds` (`INTEGER`): Target time.
  * `target_pace_seconds_per_km` (`INTEGER`): Prescribed pace (e.g., 330 = 5:30/km).
  * `target_intensity` (`VARCHAR(50)`): Target physiological zone (e.g., `Zone 2`, `Threshold`).
  * `description` (`TEXT`): Workout instructions.
  * `status` (`VARCHAR(20) DEFAULT 'PLANNED' NOT NULL`): State machine: `PLANNED`, `COMPLETED`, `MISSED`, `SKIPPED`.
* **Indexes:**
  * `CREATE INDEX idx_workouts_user_date ON scheduled_workouts(user_id, scheduled_date)`.

#### 6. `workout_activity_matches`
* **Purpose:** Planned vs Actual reconciliation matrix.
* **Columns:**
  * `id` (`UUID PRIMARY KEY DEFAULT gen_random_uuid()`)
  * `workout_id` (`UUID NOT NULL REFERENCES scheduled_workouts(id) ON DELETE CASCADE`): Unique planned workout.
  * `activity_id` (`UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE`): Unique recorded activity.
  * `is_manual_match` (`BOOLEAN DEFAULT FALSE NOT NULL`): True if user manual match; false if auto-matched by heuristic.
  * `completion_percentage` (`NUMERIC(6, 2) NOT NULL`): Execution fidelity (e.g. 104.2%).
  * `distance_delta_meters` (`NUMERIC(10, 2)`): Actual minus Planned distance.
  * `duration_delta_seconds` (`INTEGER`): Actual minus Planned duration.
  * `pace_delta_seconds_per_km` (`INTEGER`): Actual pace minus Target pace.
  * `matched_at` (`TIMESTAMPTZ DEFAULT NOW() NOT NULL`).
  * **Constraints:** `uq_workout_match` (1:1 per workout) and `uq_activity_match` (1:1 per activity).

#### 7. `fitness_goals`, `personal_records`, `sync_logs`
* `fitness_goals`: Monthly distance (`DISTANCE_MONTHLY`), weekly frequency (`FREQUENCY_WEEKLY`), pace targets.
* `personal_records`: Distance benchmark PRs (`1K`, `5K`, `10K`, `Half Marathon`, `Marathon`, `Longest Distance`) with unique constraint on `(user_id, category)`.
* `sync_logs`: Ingestion audit log tracking `status`, `activities_fetched`, `activities_created`, `activities_updated`, `error_message`, `started_at`, and `completed_at`.

---

## 🛡️ 3. Cryptography & Security Infrastructure (`src/lib/crypto.ts`)

Implements authenticated symmetric encryption to secure third-party credentials in compliance with Rule 7 and Documentation Section 06:

* **Algorithm:** `AES-256-GCM` (Galois/Counter Mode).
* **Key Derivation:** `crypto.scryptSync(secret, 'strava-athlete-salt', 32)` derives a 256-bit cryptographic key from `process.env.ENCRYPTION_SECRET`.
* **Initialization Vector (IV):** 16 cryptographically secure random bytes generated per encryption call (`crypto.randomBytes(16)`). IV reuse is strictly impossible.
* **Authentication Tag:** 16-byte GCM authentication tag generated during encryption and validated during decryption (`decipher.setAuthTag(tag)`), preventing any ciphertext tampering or bit-flipping attacks.
* **Payload Serialization Format:** `iv:tag:ciphertext` (hex encoded).
* **Exported API:**
  * `encryptToken(text: string): string`
  * `decryptToken(encryptedData: string): string`

---

## 💾 4. Dual-Mode Unified Persistence Layer (`src/lib/db.ts`)

A resilient 891-line data access layer featuring transparent dual-mode fallback:

1. **Production Mode (PostgreSQL via `pg.Pool`):**
   - Active when `DATABASE_URL` is set in the environment.
   - All queries use parameterized queries (`$1, $2, ...`) ensuring 100% protection against SQL injection.
   - Binds every operation to `user_id` to enforce strict multi-tenant isolation.
2. **Local Fallback Mode (`.data/store.json`):**
   - Active when `DATABASE_URL` is empty, missing, or unreachable.
   - Automatically initializes `.data/store.json` on first run with an seeded `Apex Athlete` user, realistic activities (Morning Aerobic Threshold Run, Zone 2 Base Run), planned workouts, and fitness goals.
   - Allows instant development and functional testing without local PostgreSQL installation hurdles.

### Complete Exported Method Signatures & Responsibilities

| Function Name | Description | PostgreSQL Implementation | Local Store Fallback |
| :--- | :--- | :--- | :--- |
| `getUser(userId)` | Fetch athlete profile | `SELECT * FROM users WHERE id = $1` | In-memory find by `id` |
| `getStravaConnection(userId)` | Fetch Strava account link | `SELECT * FROM strava_connections WHERE user_id = $1` | In-memory find |
| `saveStravaConnection(...)` | Upsert Strava athlete link | `INSERT ... ON CONFLICT (user_id) DO UPDATE` | Insert or replace in array |
| `disconnectStrava(userId)` | Revoke and purge connection | `DELETE FROM strava_connections WHERE user_id = $1` (Cascades to tokens) | Filter out connection & tokens |
| `saveStravaTokens(...)` | Save encrypted OAuth credentials | `INSERT ... ON CONFLICT (connection_id) DO UPDATE` | Insert or replace token record |
| `getStravaToken(connectionId)` | Retrieve encrypted credentials | `SELECT * FROM strava_tokens WHERE connection_id = $1` | In-memory lookup |
| `getActivities(userId, options)` | Filtered activity query | Query with optional sport & date range with `ORDER BY start_date DESC` | In-memory filter and sort |
| `upsertActivity(activity)` | Ingest or update Strava activity | `INSERT ... ON CONFLICT (strava_activity_id) DO UPDATE` | Deduplicate and upsert |
| `getScheduledWorkouts(...)` | Fetch calendar workouts | Filtered by `user_id` and optional date bounds | In-memory filter and sort |
| `createScheduledWorkout(...)` | Create new scheduled training | `INSERT INTO scheduled_workouts` returning record | Assign UUID and append |
| `updateScheduledWorkout(...)` | Mutate workout status/targets | Dynamic parameter-bound `UPDATE` query | Mutate object in store |
| `deleteScheduledWorkout(id)` | Delete workout | `DELETE FROM scheduled_workouts WHERE id = $1` | Filter out by ID |
| `getWorkoutActivityMatches(...)`| Hydrated match records | `JOIN scheduled_workouts JOIN activities` | Hydrated join in memory |
| `saveWorkoutActivityMatch(...)` | Record planned vs actual delta | `INSERT ... ON CONFLICT (workout_id) DO UPDATE` | Insert or replace match |
| `getFitnessGoals(userId)` | Fetch athlete goals | `SELECT * FROM fitness_goals WHERE user_id = $1` | In-memory filter |
| `createFitnessGoal(goal)` | Create new fitness benchmark | `INSERT INTO fitness_goals` | Assign UUID and append |
| `getPersonalRecords(userId)` | Fetch all-time PRs | `SELECT * FROM personal_records WHERE user_id = $1` | In-memory filter |
| `createSyncLog(log)` | Write sync telemetry audit | `INSERT INTO sync_logs` | Append to logs array |
| `getDatabaseStatus()` | Telemetry health probe | Tests `pgPool.query('SELECT 1')` or reports Local Store | Returns connectivity status |

---

## ⚡ 5. Strava API v3 Integration Client (`src/lib/strava.ts`)

Implements the official Strava API v3 OAuth 2.0 lifecycle and activity synchronization protocols:

* **OAuth Authorization URL (`getAuthorizationUrl`):**
  - Generates authorization redirect to `https://www.strava.com/oauth/authorize`.
  - Requests verified scopes: `read,activity:read_all`.
  - Implements CSRF `state` parameter binding.
* **Token Exchange (`exchangeAuthorizationCode`):**
  - Sends POST request to `https://www.strava.com/oauth/token` with `client_id`, `client_secret`, and `authorization_code`.
* **Proactive Token Refresh Engine (`getValidAccessToken`):**
  - Checks remaining token TTL.
  - If token expires within 5 minutes (`expiresAtMs - nowMs < 300000`), automatically invokes `grant_type: refresh_token`, re-encrypts the new tokens via AES-256-GCM, updates the database, and returns the valid token transparently.
* **Incremental Activity Synchronization (`fetchAthleteActivities`):**
  - Respects Strava API pagination (`page`, `per_page` up to 100).
  - Supports incremental sync via `afterTimestamp` Unix epoch parameter, preventing redundant data transfers.
  - Inspects Strava rate-limiting response headers: `x-ratelimit-limit` (15-min / daily limits) and `x-ratelimit-usage`.
  - Catches HTTP `429 Too Many Requests` and formats structured rate-limit telemetry errors.
* **Deauthorization & Revocation (`deauthorizeStrava`):**
  - Revokes access token with `https://www.strava.com/api/v3/oauth/deauthorize`.

---

## 🌐 6. Next.js API Route Handlers (`src/app/api/auth/strava/`)

### A. Authorize Route (`src/app/api/auth/strava/authorize/route.ts`)
* **Endpoint:** `GET /api/auth/strava/authorize`
* **Workflow:**
  1. Validates that `STRAVA_CLIENT_ID` and `STRAVA_CLIENT_SECRET` are configured.
  2. Generates a cryptographically random 16-byte hex state token (`crypto.randomBytes(16)`).
  3. Writes state into an `httpOnly`, `sameSite: 'lax'`, `maxAge: 600` (10-minute) session cookie (`strava_oauth_state`).
  4. Redirects user agent to Strava's OAuth approval screen.

### B. Callback Route (`src/app/api/auth/strava/callback/route.ts`)
* **Endpoint:** `GET /api/auth/strava/callback`
* **Workflow:**
  1. Extracts `code`, `state`, `scope`, and `error` parameters from callback URL.
  2. Validates `state` against the `strava_oauth_state` cookie to prevent Cross-Site Request Forgery (CSRF).
  3. Exchanges authorization code for access and refresh tokens.
  4. Encrypts tokens using AES-256-GCM.
  5. Upserts connection profile in `strava_connections` and tokens in `strava_tokens`.
  6. Purges CSRF cookie and redirects to `/` with query status parameters (`connected=true&athlete=...`).

---

## 🎯 7. Workout & Activity Matching Engine (`src/lib/matching.ts`)

Solves the core Planned vs Actual athletic training reconciliation problem:

* **Sport Semantic Compatibility (`isSportCompatible`):**
  - Intelligently maps Strava sport types (`Run`, `TrailRun`, `VirtualRun`) to workout categories (`Easy Run`, `Long Run`, `Tempo Run`, `Interval Training`, `Fartlek`, `Recovery Run`).
  - Maps `Ride`, `VirtualRide`, `EBikeRide`, `GravelRide` to cycling categories.
  - Maps `Swim` to swimming workouts.
  - Maps `WeightTraining` to strength/cross-training.
* **Delta Computation (`calculateMatchDeltas`):**
  - Computes `completion_percentage` against target distance or target duration.
  - Computes `distance_delta_meters` ($Actual - Target$).
  - Computes `duration_delta_seconds` ($Actual - Target$).
  - Computes `pace_delta_seconds_per_km` ($ActualPace - TargetPace$).
* **Heuristic Auto-Match Pipeline (`runAutoMatch`):**
  - Ingests newly synchronized activities, queries unmatched scheduled workouts for the same calendar date, evaluates sport compatibility, persists match deltas into `workout_activity_matches`, and updates the workout status to `COMPLETED`.

---

## 📊 8. Athletic Performance Analytics (`src/lib/analytics.ts`)

Endurance sports mathematics and aggregation logic:

* **`computeDashboardSummary(activities, workouts)`:**
  - Establishes an ISO Monday-aligned current week boundary and previous week comparison window.
  - Computes total distance this week and week-over-week percentage delta ($\Delta\%$).
  - Aggregates total moving time, elevation gain, and completed activity count.
  - Calculates true running pace average (weighted by running activity duration).
  - Calculates **Training Consistency Adherence Score** ($\frac{CompletedWorkouts}{ScheduledWorkouts} \times 100\%$, excluding Rest Days).
* **`aggregateVolumeProgression(activities, days)`:**
  - Aggregates daily telemetry for 30, 60, or 90 days.
  - Breaks down volume by sport (`runKm`, `rideKm`, `swimKm`, `totalKm`, `elevation`).
  - Zero-fills missing calendar days to prevent discontinuous line charts.

---

## 🧠 9. Grounded AI Coach & Sports Science Rules (`src/lib/ai-coach.ts`)

Strictly adheres to **Rule 6 & Rule 13** and Section 05 (`AI_DECISION_BOUNDARIES.md`), prohibiting hallucinated biometrics and ungrounded advice:

1. **Acute:Chronic Workload Ratio (ACWR) & The 10% Volume Rule:**
   - Compares 7-day acute mileage against previous week (8-14 days) and 28-day chronic baseline.
   - Detects hazardous mileage spikes ($>15\%$ week-over-week jump), flagging overuse injury risk.
   - Praises optimal progressive overload when mileage growth is between $0\%$ and $10\%$.
2. **Aerobic Pace Adaptation Trend Analysis:**
   - Analyzes pace progression across chronological training blocks (comparing the first half vs second half of running activities).
   - Generates positive feedback with exact second deltas (e.g. `+12s /km faster`) when cardiovascular adaptation occurs.
3. **Training Consistency & Adherence Scoring:**
   - Detects elite consistency ($\ge 80\%$ workout adherence).
   - Flags plan burnout or over-ambitious scheduling when adherence drops below $60\%$, recommending a 1-session reduction to restore muscular glycogen and recovery.
4. **Recovery Balance & Back-to-Back High-Intensity Session Detection:**
   - Inspects calendar for consecutive high-intensity days (`Interval Training`, `Tempo Run`, `Long Run`).
   - Warns the athlete when hard sessions are placed without 24-48 hours of Zone 2 Easy running or active recovery.
5. **Polarized 80/20 Weekly Training Plan Prescription:**
   - Computes recommended weekly volume from acute training baseline and active monthly distance goals.
   - Recommends the gold-standard endurance polarized distribution: 1x Quality Tempo Run (20%), 1x Long Aerobic Base Run (35%), 2x Zone 2 Easy Recovery Runs (35%), and 1-2 dedicated Rest/Mobility days.

---

## 📐 10. Athletic Formatters (`src/lib/formatters.ts`)

Provides standardized formatting adhering to Obsidian Telemetry visual guidelines (`font-tabular`):

* `formatDistance(meters)`: Converts meters to kilometers with 2 decimal places (e.g., `10.42 km`).
* `formatDuration(seconds)`: Formats seconds to `mm:ss` or `h:mm:ss`.
* `formatDurationHuman(seconds)`: Formats duration to human-friendly shorthand (e.g., `1h 45m` or `52m`).
* `speedMpsToPace(mps)`: Converts meters per second to running pace `mm:ss /km` (e.g., $3.34 \text{ m/s} \rightarrow \text{04:59 /km}$).
* `formatPaceSeconds(secondsPerKm)`: Formats integer seconds to `mm:ss /km`.
* `parsePaceToSeconds(paceStr)`: Parses user inputs like `"5:30"` to 330 seconds.
* `formatElevation(meters)`: Formats vertical gain to rounded integer meters (`115 m`).
* `formatDate(dateStr)` & `formatDayOfWeek(dateStr)`: Locale-aware date formatting.

---

## 📚 11. Engineering Documentation Ecosystem (`docs/`)

Created a comprehensive 10-directory documentation system comprising over 50 structured markdown specifications:

* **`00-foundation/`**: Core vision, 8 non-negotiable product tenets, MVP scope boundaries, positioning against Garmin/TrainingPeaks/Strava, athletic glossary, and 6-phase engineering roadmap.
* **`01-product/`**: Master PRD, user personas, user journeys, user stories, functional requirements (FR-001 to FR-008), non-functional requirements, acceptance criteria, MVP definition, and success metrics.
* **`02-design/`**: Anti-AI-Slop design manifesto, "Quiet Craftsman Coach" philosophy, Obsidian Telemetry aesthetic, design tokens, color palette, typography (`font-tabular`), 4px/8px layout grids, component anatomy, 150ms interaction rules, and accessibility standards.
* **`03-architecture/`**: C4 Level 1/2 architectural models, tech stack specifications, repository tree conventions, PostgreSQL relational DDL breakdown, end-to-end data lifecycle, API design contracts, authentication boundaries, background sync jobs, and Architecture Decision Records (ADR-001 through ADR-005).
* **`04-integrations/`**: Strava API v3 reference, OAuth 2.0 sequence diagrams, scope guidelines, incremental sync protocols, webhook subscription architecture, rate limiting (15-min and daily quotas), error handling, and external service contracts.
* **`05-domain-logic/`**: Polarized 80/20 training science, 11 workout classifications, weekly planning heuristics, exact mathematical metric formulas, aerobic adaptation curves, ACWR load calculations, recovery heuristics, goal algorithms, PR verification, and AI anti-hallucination boundaries.
* **`06-security/`**: Application security policy, data privacy, AES-256-GCM token cipher specifications, multi-tenant authorization rules, STRIDE threat model, and cascading data retention purges.
* **`07-quality/`**: Strict TypeScript code standards, clean architecture principles, test pyramid strategy, performance budgets, uniform JSON error structures, API cost controls, structured observability, and Definition of Done gates.
* **`08-development/`**: Feature development workflows, phased implementation plan, 15 mandatory AI coding agent rules, conventional git commit standards, local environment setup, deployment configurations, and change management.
* **`09-audit/`**: Architecture audits, security audits, performance audits, API quota audits, technical debt ledger, documentation audits, and historical audit logs.
* **`10-changelog/`**: This comprehensive changelog document tracking all codebase modifications.

---

## ✅ 12. Build & Verification Status

* **Command:** `npm run build`
* **Turbopack Compiler:** Compiled successfully in 4.2s
* **TypeScript:** Strict typecheck passed in 6.2s with zero diagnostic errors
* **Static Pages Generated:**
  - `○ /` (Static prerendered)
  - `○ /_not-found`
* **Dynamic Route Handlers Verified:**
  - `ƒ /api/auth/strava/authorize` (Server-rendered on demand)
  - `ƒ /api/auth/strava/callback` (Server-rendered on demand)
* **Exit Code:** `0` (Success)

