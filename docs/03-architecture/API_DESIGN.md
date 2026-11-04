# Internal REST API Specification

**Status:** CONFIRMED & AUDITED  
**Version:** 2.0  
**Last Updated:** 2026-11-03  
**Owner:** Senior Backend Engineer & Architecture Governance  
**Related Documents:** [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md), [ATHLETE_HEALTH_API.md](./ATHLETE_HEALTH_API.md)

---

## 1. Endpoints Overview (Next.js 16 App Router)

| Method | Endpoint | Description | Request Payload | Response Contract |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/auth/strava/authorize` | Initiates Strava OAuth flow, generates CSRF state cookie. | None | 302 Redirect to Strava OAuth |
| `GET` | `/api/auth/strava/callback` | Exchanges code for tokens, encrypts AES-256-GCM, saves connection. | Query parameters (`code`, `state`) | 302 Redirect to `/` |
| `GET` | `/api/auth/strava/status` | Returns active Strava connection and athlete identity. | None | `{ connected: boolean, athlete: {...} }` |
| `POST` | `/api/auth/strava/disconnect` | Revokes access tokens via Strava deauthorize API and flags connection inactive. | None | `{ success: boolean, message: string }` |
| `POST` | `/api/strava/sync` | Fetches new activities incrementally, executes auto-match heuristic. | None | `{ success: boolean, count: number, matched: number }` |
| `GET` | `/api/activities` | Retrieves paginated activities with search and sport filter. | Query (`limit`, `offset`, `sport`) | `Activity[]` |
| `POST` | `/api/activities` | Manually inserts an activity record. | JSON (`name`, `distance_meters`, `moving_time_seconds`, etc.) | `Activity` |
| `GET` | `/api/activities/[id]` | Retrieves deep telemetry for a single activity. | Path param `id` | `Activity` |
| `PATCH`| `/api/activities/[id]` | Edits telemetry fields for an activity. | JSON (`name`, `distance_meters`, `moving_time_seconds`, etc.) | `Activity` |
| `POST` | `/api/activities/parse-image` | Extracts telemetry from screenshot uploads via OCR heuristics. | `multipart/form-data` (file) | `{ success: boolean, parsed: {...} }` |
| `GET` | `/api/athlete/health-context` | Returns consolidated clinical health dossier and readiness state. | None | `AthleteHealthContext` |
| `GET` | `/api/athlete/profile` | Retrieves athlete biometrics and profile settings. | None | `AthleteProfile` |
| `PATCH`| `/api/athlete/profile` | Updates resting HR, max HR, weight, height, and bio parameters. | JSON (`weight_kg`, `resting_hr_bpm`, etc.) | `AthleteProfile` |
| `GET` | `/api/athlete/injuries` | Retrieves list of recorded injuries and recovery statuses. | None | `AthleteInjury[]` |
| `POST` | `/api/athlete/injuries` | Adds a new injury record to clinical registry. | JSON (`injury_name`, `body_part`, `anatomical_location`, etc.) | `AthleteInjury` |
| `POST` | `/api/athlete/checkin` | Submits longitudinal post-activity joint/pain check-in. | JSON (`activity_id`, `pain_score`, `swelling_observed`, etc.) | `AthletePainLog` |
| `POST` | `/api/athlete/medical-procedure` | Records clinical therapy, scan, or medical assessment. | JSON (`procedure_name`, `provider_name`, `notes`, etc.) | `AthleteMedicalAssessment` |
| `POST` | `/api/training/generate` | Generates or regenerates 12-Week Zone 2 periodization plan. | None | `{ success: boolean, plan: TrainingPlan }` |

---

## 2. Server Component Direct Data Layer
Under Next.js 16 Partial Prerendering, read-intensive views (`/`, `/activities`, `/training`, `/health`, `/goals`) utilize direct asynchronous database repository queries (`src/lib/db/*`) inside Server Components with `await connection()` rather than redundant internal HTTP fetches, guaranteeing sub-50ms render latency.
