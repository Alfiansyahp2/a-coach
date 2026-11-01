# Functional Requirements Specification

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Product Requirements Engineer  
**Related Documents:** [PRD.md](./PRD.md), [ACCEPTANCE_CRITERIA.md](./ACCEPTANCE_CRITERIA.md)

---

## 1. Authentication & Strava Connectivity
* **FR-AUTH-001:** The system shall initiate Strava OAuth 2.0 authorization requesting scopes `read` and `activity:read_all`.
* **FR-AUTH-002:** The system shall generate a cryptographically random `state` parameter stored in an HTTP-only cookie and validate it upon callback to prevent CSRF attacks.
* **FR-AUTH-003:** The system shall securely encrypt OAuth `access_token` and `refresh_token` using AES-256-GCM before writing to storage.
* **FR-AUTH-004:** The system shall check token expiration before every API request and automatically refresh expired tokens if within 5 minutes of expiration.
* **FR-AUTH-005:** The system shall support disconnecting Strava, revoking access tokens via `https://www.strava.com/oauth/deauthorize`, and deactivating the connection record.

## 2. Activity Ingestion & Synchronization
* **FR-SYNC-001:** The system shall fetch authorized athlete activities incrementally using the `after` timestamp of the most recent stored activity.
* **FR-SYNC-002:** The system shall guarantee idempotent upserts using the unique numeric `strava_activity_id`.
* **FR-SYNC-003:** The system shall log every synchronization attempt to `sync_logs` including status, count of fetched/created/updated activities, and error messages.
* **FR-SYNC-004:** The system shall inspect response headers `X-RateLimit-Limit` and `X-RateLimit-Usage` and pause execution if rate limits are exceeded (HTTP 429).

## 3. Training Planner & Calendar
* **FR-PLAN-001:** The system shall render a 7-day calendar (Monday through Sunday) for any selected week.
* **FR-PLAN-002:** The system shall support 11 workout classifications: Easy Run, Long Run, Tempo Run, Interval Training, Recovery Run, Fartlek, Cycling, Swimming, Strength Training, Cross Training, Rest Day.
* **FR-PLAN-003:** The system shall permit users to create, read, update, reschedule, and delete scheduled workouts.
* **FR-PLAN-004:** Each scheduled workout shall store target distance, target duration, target pace, target intensity, and description.

## 4. Workout Comparison Engine
* **FR-COMP-001:** The system shall automatically match unscheduled activities to planned workouts occurring on the same date with compatible sport types.
* **FR-COMP-002:** The system shall calculate distance variance ($Delta d = d_{act} - d_{plan}$), duration variance ($Delta t = t_{act} - t_{plan}$), and pace variance ($Delta p = p_{act} - p_{plan}$).
* **FR-COMP-003:** The system shall provide a manual matching interface allowing athletes to override, pair, or unpair any workout-activity combination.

## 5. Analytics & Goals
* **FR-ANAL-001:** The system shall compute weekly distance totals and percentage delta compared to the previous week.
* **FR-ANAL-002:** The system shall filter analytics charts across 7 days, 30 days, 90 days, 6 months, and 1 year.
* **FR-ANAL-003:** The system shall track personal records across standard benchmarks: 1K, 5K, 10K, Half Marathon, Marathon, Longest Distance.
* **FR-ANAL-004:** The system shall track fitness goals with real-time percentage progress bars and projected completion dates.

## 6. Grounded AI Coach
* **FR-COACH-001:** The system shall calculate Acute:Chronic Workload Ratio (ACWR) using 7-day acute volume and 28-day chronic volume.
* **FR-COACH-002:** The system shall trigger a volume spike warning whenever 7-day distance exceeds previous week distance by $>15%$.
* **FR-COACH-003:** The system shall evaluate pacing adaptation across historical aerobic runs.
* **FR-COACH-004:** All AI insights must cite the supporting mathematical data and include disclaimers that suggestions do not constitute medical advice.
