# Acceptance Criteria Specification (Given / When / Then)

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** QA Architect & Test Engineer  
**Related Documents:** [USER_STORIES.md](./USER_STORIES.md), [TESTING_STRATEGY.md](../07-quality/TESTING_STRATEGY.md)

---

## AC-001: Strava Token Refresh Pre-Flight Check
* **Given** an authenticated athlete whose Strava `expires_at` timestamp is within 3 minutes of the current time,
* **When** a background sync or manual sync request is initiated,
* **Then** the server must call Strava's token endpoint with `grant_type=refresh_token` before requesting activities,
* **And** the newly issued `access_token` and `refresh_token` must be re-encrypted and persisted,
* **And** the sync request must complete successfully without an HTTP 401 Unauthorized error.

## AC-002: Automatic Workout Matching
* **Given** a planned workout with Date = "2026-11-04" and Category = "Tempo Run",
* **And** an unmatched Strava activity logged on "2026-11-04" with sport = "Run" and distance = 10,200m,
* **When** `runAutoMatch()` is executed,
* **Then** a new record must be inserted into `workout_activity_matches` linking the two,
* **And** the planned workout's status must transition to `COMPLETED`,
* **And** the calculated `distance_delta_meters` must equal +200 meters.

## AC-003: 10% Volume Spike Warning
* **Given** an athlete whose distance logged 8-14 days ago was 40.00 km,
* **And** whose distance logged in the last 7 days is 52.00 km (+30% increase),
* **When** `generateTrainingInsights()` is evaluated,
* **Then** a warning insight of type `volume_warning` must be generated,
* **And** the title must indicate a volume spike (>10% rule),
* **And** the description must cite the exact 52 km vs 40 km empirical values.
