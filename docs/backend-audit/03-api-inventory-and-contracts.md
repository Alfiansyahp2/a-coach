# A-COACH — REPOSITORY-AWARE BACKEND LOGIC & API FLOW AUDIT
## Document 03: API Inventory, Endpoint Specifications & Contract Audit

> **Audit Date**: 2026-11-07  
> **Framework**: Next.js 16.4.3 App Router  
> **Base Route Directory**: [`src/app/api/`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/)  
> **Total Audited Endpoints**: 16 Route Files (21 HTTP Handlers)

---

### 1. Master API Route Directory & Contract Matrix

| HTTP Method | Route Path | Implementation File | Primary Controller Function | Auth Required | Contract Status | Critical Discrepancy / Risk |
|---|---|---|---|---|---|---|
| **GET** | `/api/activities` | [`src/app/api/activities/route.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/activities/route.ts#L6) | `getActivities` | None | `FUNCTIONAL` | Returns all activities for default user. Filters: `limit`, `sport_type`. |
| **POST** | `/api/activities` | [`src/app/api/activities/route.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/activities/route.ts#L27) | `createManualActivity` | None | `FUNCTIONAL` | Synthesizes fake Strava ID (`Date.now() * 1000 + rand`) to satisfy schema. |
| **GET** | `/api/activities/[id]` | [`src/app/api/activities/[id]/route.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/activities/[id]/route.ts#L5) | `getActivityById` | None | `FUNCTIONAL` | Fetches single activity by UUID. |
| **PATCH** | `/api/activities/[id]` | [`src/app/api/activities/[id]/route.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/activities/[id]/route.ts#L26) | `updateActivity` | None | `FUNCTIONAL` | Partially updates activity fields. Recalculates `average_speed_mps`. |
| **DELETE** | `/api/activities/[id]` | *MISSING* | *NONE* | None | `DEFECT (MISSING)` | **Endpoint does not exist**. Athletes cannot delete an activity. |
| **POST** | `/api/activities/parse-image` | [`src/app/api/activities/parse-image/route.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/activities/parse-image/route.ts#L10) | Python Child Process | None | `RISK (HOST-BOUND)` | Spawns `python scripts/parsers/parse_activity_image.py`. Unused `tesseract.js`. |
| **GET** | `/api/athlete/profile` | [`src/app/api/athlete/profile/route.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/athlete/profile/route.ts#L13) | `getUser`, `getAthleteProfile` | None | `FUNCTIONAL` | Returns user biometrics, clinical profile, and authoritative health context. |
| **POST / PUT** | `/api/athlete/profile` | [`src/app/api/athlete/profile/route.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/athlete/profile/route.ts#L43) | `updateUserProfile` | None | `FUNCTIONAL` | Updates biometrics and records optional clinical procedures. |
| **GET** | `/api/athlete/injuries` | [`src/app/api/athlete/injuries/route.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/athlete/injuries/route.ts#L17) | `getAthleteInjuries` | None | `FUNCTIONAL` | Retrieves list of recorded injury dossiers. |
| **POST** | `/api/athlete/injuries` | [`src/app/api/athlete/injuries/route.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/athlete/injuries/route.ts#L36) | `createAthleteInjury` | None | `FUNCTIONAL` | Creates injury dossier, triggers readiness recalculation, logs audit trail. |
| **PATCH** | `/api/athlete/injuries/[id]` | *MISSING* | *NONE* | None | `DEFECT (MISSING)` | **Endpoint does not exist**. Injury status cannot be directly modified. |
| **POST** | `/api/athlete/checkin` | [`src/app/api/athlete/checkin/route.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/athlete/checkin/route.ts#L18) | `upsertAthleteTrainingResponse` | None | `LOGIC DEFECT` | Falls back to `'Anterior Knees'` / `'Right Ankle'` if `body_region` omitted. |
| **GET** | `/api/athlete/health-context` | [`src/app/api/athlete/health-context/route.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/athlete/health-context/route.ts#L10) | `getAuthoritativeHealthContext` | None | `FUNCTIONAL` | Aggregates profile, injuries, pain logs, responses, and latest readiness. |
| **POST** | `/api/athlete/medical-procedure`| [`src/app/api/athlete/medical-procedure/route.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/athlete/medical-procedure/route.ts#L5) | `recordMedicalProcedure...` | None | `FUNCTIONAL` | Records clinical assessment and return-to-sport clearance status. |
| **GET** | `/api/athlete/streak` | [`src/app/api/athlete/streak/route.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/athlete/streak/route.ts#L5) | `calculateWeeklyStreak` | None | `DATA FABRICATION RISK`| In `catch` block, returns **fabricated 9-week streak with 34 contributions**. |
| **GET** | `/api/goals` | [`src/app/api/goals/route.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/goals/route.ts#L5) | `getFitnessGoals` | None | `FUNCTIONAL` | Returns all fitness goals (4 active in DB). |
| **POST** | `/api/goals` | [`src/app/api/goals/route.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/goals/route.ts#L17) | `createFitnessGoal` / `setPrimary` | None | `DESTRUCTIVE PLAN REGEN`| If `action === 'set_primary'`, regenerates plan and **deletes all workouts**. |
| **POST** | `/api/training/generate` | [`src/app/api/training/generate/route.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/training/generate/route.ts#L5) | `generateCoachTraining...` | None | `DESTRUCTIVE PLAN REGEN`| Deletes existing workouts and hardcodes start date to `2026-11-02`. |
| **GET** | `/api/strava/sync` | [`src/app/api/strava/sync/route.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/strava/sync/route.ts#L18) | Telemetry query | None | `FUNCTIONAL (INACTIVE)` | Returns connection status: `isConnected: false`. |
| **POST** | `/api/strava/sync` | [`src/app/api/strava/sync/route.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/strava/sync/route.ts#L43) | `fetchAthleteActivities` | None | `FUNCTIONAL (INACTIVE)` | Returns HTTP 400 (`CONFIG_MISSING`) because Strava connection is empty. |
| **GET** | `/api/auth/strava/*` | [`src/app/api/auth/strava/`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/auth/strava/) | OAuth Handlers | None | `FUNCTIONAL (INACTIVE)` | Strava OAuth flow (authorize, callback, disconnect, status). |

---

### 2. Deep-Dive Endpoint Contract Specifications

#### 2.1. `POST /api/activities` (Manual Activity Ingestion)
- **Request Body (JSON)**:
  ```json
  {
    "name": "Latihan MTB Zone 2",
    "sport_type": "Ride",
    "start_date": "2026-11-06T06:50:00Z",
    "distance_meters": 24500,
    "moving_time_seconds": 3600,
    "elevation_gain_meters": 120,
    "average_speed_mps": 6.81,
    "description": "Rute perbukitan santai",
    "rpe_score": 3,
    "pain_during_activity": 0,
    "pain_after_activity": 0,
    "swelling_observed": false,
    "instability_observed": false
  }
  ```
- **Validation Rules**:
  - `name` and `sport_type` are mandatory (HTTP 400 if missing).
  - Telemetry fields (`distance_meters`, `moving_time_seconds`) are cast with `Number(...) || 0`.
- **Response Contract (HTTP 200)**:
  ```json
  {
    "success": true,
    "activity": { "id": "uuid", "strava_activity_id": 1793924856000, "name": "Latihan MTB Zone 2", ... },
    "matchedWorkout": { "id": "uuid", "workout_category": "Ride", "status": "COMPLETED" },
    "match": { "completion_percentage": 98.0, "distance_delta_meters": -500 },
    "trainingResponse": { "id": "uuid", "rpe_score": 3, "fatigue_response": "LOW" }
  }
  ```
- **Architectural Findings**:
  - `strava_activity_id` is fabricated in `activityRepo.ts` line 330: `Date.now() * 1000 + Math.floor(Math.random() * 1000)` because the column is `BIGINT NOT NULL UNIQUE`.
  - Automatic cache revalidation is called (`revalidatePath('/')`, `revalidatePath('/activities')`, `revalidatePath('/training')`).

#### 2.2. `POST /api/athlete/checkin` (Post-Activity Clinical Response)
- **Request Body (JSON)**:
  ```json
  {
    "sport_type": "Ride",
    "distance_km": 24.5,
    "duration_seconds": 3600,
    "rpe_score": 3,
    "pain_during_activity": 0,
    "pain_after_activity": 0,
    "pain_next_day": 0,
    "swelling_observed": false,
    "instability_observed": false,
    "body_region": "Right Ankle",
    "side": "RIGHT"
  }
  ```
- **Defect Identified**:
  - In [`src/app/api/athlete/checkin/route.ts#L52`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/athlete/checkin/route.ts#L52):
    ```typescript
    body_region: body.body_region || (body.sport_type === 'Run' ? 'Anterior Knees' : 'Right Ankle')
    ```
    If an athlete records wrist or hip pain but omits `body_region`, running activities default to `Anterior Knees` and all other sports default to `Right Ankle`. This introduces falsified medical records into `athlete_pain_logs`.

#### 2.3. `GET /api/athlete/streak` (Weekly Training Streak)
- **Response Contract (HTTP 200)**:
  ```json
  {
    "success": true,
    "currentStreakWeeks": 10,
    "longestStreakWeeks": 10,
    "isFlameBurning": true,
    "isFlameAtRisk": false,
    "totalContributions": 37,
    "heatTier": {
      "stage": 2,
      "name": "Api Oranye",
      "temperatureText": "~1,100°C",
      "colorHex": "#F97316"
    }
  }
  ```
- **Defect Identified**:
  - In [`src/app/api/athlete/streak/route.ts#L28`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/athlete/streak/route.ts#L28): The `catch` block catches database failures and returns a **hardcoded fake payload** (`currentStreakWeeks: 9`, `totalContributions: 34`, `heatTier: Stage 1`). Fabricating telemetry during an error violates core medical and platform integrity principles.

---

### 3. Missing API Endpoints Catalog

1. **`DELETE /api/activities/[id]`**:
   - Absence prevents athletes from deleting mistaken, duplicate, or corrupted activity entries from the UI.
2. **`PATCH /api/athlete/injuries/[id]`**:
   - Absence prevents updating injury recovery status, timeframe descriptions, or functional limitations without executing manual SQL queries.
3. **`POST /api/activities/batch`**:
   - Claimed in README ("Batch Activity Updates"), but completely missing from backend routes.

