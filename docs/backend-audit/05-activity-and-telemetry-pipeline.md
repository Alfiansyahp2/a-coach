# A-COACH — REPOSITORY-AWARE BACKEND LOGIC & API FLOW AUDIT
## Document 05: Activity & Telemetry Pipeline, Kinematics & Multi-Sport Engine

> **Audit Date**: 2026-11-07  
> **Core Module**: Manual Telemetry Pipeline & Multi-Sport Extensibility  
> **Key Files**: [`src/lib/db/activityRepo.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db/activityRepo.ts), [`src/lib/domain/sports/sportUtils.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/sports/sportUtils.ts), [`src/lib/shared/formatters.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/shared/formatters.ts)  
> **Database Table**: `activities` (35 Rows in PostgreSQL 16)

---

### 1. Manual Activity Ingestion & Field Normalization

Because `a-coach` operates without an active Strava API connection, manual entry via [`src/app/api/activities/route.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/activities/route.ts) is the primary ingestion pathway.

#### Supported Ingestion Schema:
- **Mandatory**: `name` (string), `sport_type` (string).
- **Core Telemetry**:
  - `start_date` (ISO-8601 string, defaults to `now()`).
  - `distance_meters` (numeric, meters).
  - `moving_time_seconds` (integer, seconds).
  - `elapsed_time_seconds` (integer, defaults to `moving_time_seconds`).
  - `elevation_gain_meters` (numeric, meters, defaults to `0`).
- **Optional Wearable Metrics** (strictly optional; never fabricated):
  - `average_heartrate`, `max_heartrate` (bpm).
  - `average_cadence` (rpm / spm).
  - `average_watts` (watts).
  - `calories` (kcal).
- **Clinical Integration**:
  - `rpe_score` (Borg CR10, 1–10).
  - `pain_during_activity`, `pain_after_activity`, `pain_next_day` (0–10).
  - `swelling_observed`, `instability_observed` (booleans).
  - `workout_id` (optional explicit correlation override).

---

### 2. Kinematics Mathematical Formulas

Kinematic metrics are computed deterministically in [`src/lib/db/activityRepo.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db/activityRepo.ts#L339) and formatted via [`src/lib/shared/formatters.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/shared/formatters.ts):

#### 1. Average Speed (Meters per Second):
$$\text{average\_speed\_mps} = \frac{\text{distance\_meters}}{\text{moving\_time\_seconds}}$$
- Code implementation:
  ```typescript
  if (!average_speed_mps && moving_time_seconds > 0 && distance_meters > 0) {
    average_speed_mps = Number((distance_meters / moving_time_seconds).toFixed(2));
  }
  ```
- Stored as `numeric` in the `activities` table.

#### 2. Speed Display in Kilometers per Hour:
$$\text{Speed (km/h)} = \text{average\_speed\_mps} \times 3.6$$
- Used for non-pace sports: Cycling (`Ride`), Swimming (`Swim`), Gym (`WeightTraining`), General (`Workout`).

#### 3. Running Pace in Minutes & Seconds per Kilometer:
$$\text{Pace (seconds/km)} = \frac{1000}{\text{average\_speed\_mps}} = \frac{\text{moving\_time\_seconds}}{\text{distance\_meters} / 1000}$$
- Formatted as `MM:SS /km`:
  ```typescript
  export function formatPaceSeconds(secondsPerKm: number): string {
    if (!secondsPerKm || secondsPerKm <= 0 || !isFinite(secondsPerKm)) return '--:-- /km';
    const minutes = Math.floor(secondsPerKm / 60);
    const seconds = Math.round(secondsPerKm % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')} /km`;
  }
  ```
- Used for pace-based sports: Running (`Run`), Walking (`Walk`), Hiking (`Hike`).

---

### 3. The Synthetic Strava ID Dependency (Critical Smell)

In [`src/lib/db/activityRepo.ts#L330`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db/activityRepo.ts#L330), manual activity creation executes:
```typescript
const syntheticStravaId = Date.now() * 1000 + Math.floor(Math.random() * 1000);
```

#### Why This Exists:
The relational schema table `activities` was originally designed for Strava sync and enforces:
```sql
strava_activity_id BIGINT UNIQUE NOT NULL
```
Because the column is marked `NOT NULL UNIQUE`, every manual activity entered by an athlete must invent a fake 16-digit integer (`Date.now() * 1000 + rand`) to avoid violating the constraint.

#### Architectural Liability:
1. **Third-Party Vendor Coupling**: An application functioning manual-first is forced to simulate vendor IDs on its primary activity entity.
2. **Conflict Risk**: If an athlete eventually connects Strava in the future, synthetic IDs could theoretically collide with genuine Strava IDs (though unlikely due to magnitude) or fail to represent authentic manual entries.
3. **Audit Confusion**: A developer inspecting the `activities` table cannot immediately distinguish a genuine Strava-synced activity from a manual activity without inspecting `raw_summary_polyline` or `description`.

**Recommendation**: Alter `activities` to make `strava_activity_id BIGINT NULL UNIQUE`, and add a first-class `is_manual BOOLEAN NOT NULL DEFAULT true` column.

---

### 4. Dynamic Sport Extensibility Engine

The sport classification system is defined in [`src/lib/domain/sports/sportUtils.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/sports/sportUtils.ts):

| Sport ID | Name | Label | Icon | Pace Format | Accent Color |
|---|---|---|---|---|---|
| `Ride` | Sepeda | Sepeda (Ride) | `bike` | `false` (km/h) | `#4D947B` (Sage Green) |
| `Run` | Lari | Lari (Run) | `footprints` | `true` (min/km) | `#D98757` (Terracotta) |
| `Swim` | Renang | Renang (Swim) | `waves` | `false` (m / min) | `#38BDF8` (Sky Blue) |
| `Walk` | Jalan Kaki | Jalan Kaki (Walk) | `compass` | `true` (min/km) | `#E5A84B` (Amber) |
| `Hike` | Hiking | Hiking (Hike) | `compass` | `true` (min/km) | `#E5A84B` (Amber) |
| `WeightTraining`| Gym & Beban | Gym / Beban | `dumbbell` | `false` | `#D65F58` (Rose) |
| `Workout` | Latihan Umum | Workout / Kondisi | `activity` | `false` | `#B9DC72` (Olive Green) |
| *Custom* | Clean Capitalized | *Custom Name* | `activity` | `false` (km/h) | `#4D947B` |

#### Architectural Finding:
README claims "Dynamic Sport Registration", suggesting athletes can define and save new sport types. In reality:
- There is **no database table** `sport_types` or `custom_sports`.
- Sport type strings are stored verbatim in `activities.sport_type`.
- When an unknown sport (e.g. "Kayaking") is rendered, `getSportMeta()` synthesizes a fallback styling object in memory using string capitalization.
- Custom sports cannot configure their preferred pace format (`isPaceFormat`) or icon; they default to `false` (km/h) and the generic `activity` icon.

---

### 5. Activity CRUD & Query Capabilities

#### 1. Activity Query (`getActivities`):
- Supports parameters: `userId`, `sportType`, `limit`, `afterDate`.
- Formats sorting by `ORDER BY start_date DESC`.
- Correctly parses ISO date strings via custom OID 1082 parser.

#### 2. Activity Update (`updateActivity`):
- Partially updates: `name`, `sport_type`, `start_date`, `description`, `distance_meters`, `moving_time_seconds`, `elevation_gain_meters`.
- Automatically recalculates `average_speed_mps = round((newDistance / newMovingTime) * 1000) / 1000`.
- Updates `updated_at = NOW()`.

#### 3. Activity Deletion: **COMPLETELY ABSENT**
- No `deleteActivity` repository function exists in `src/lib/db/activityRepo.ts`.
- No `DELETE` HTTP handler exists in `src/app/api/activities/[id]/route.ts`.
- If an athlete logs an incorrect distance or accidental duplicate session, they cannot delete it from the application.

