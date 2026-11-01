# Internal REST API Specification

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Senior Backend Engineer  
**Related Documents:** [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md)

---

## 1. Endpoints Overview

| Method | Endpoint | Description | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/auth/strava/authorize` | Initiates OAuth flow, sets state cookie. | None | 302 Redirect to Strava |
| `GET` | `/api/auth/strava/callback` | Exchanges code for tokens, encrypts, saves. | None | 302 Redirect to / |
| `GET` | `/api/auth/strava/status` | Returns current connection status. | None | `{ connected: boolean, athlete: {...} }` |
| `POST` | `/api/auth/strava/disconnect`| Revokes tokens and deactivates connection. | None | `{ success: true }` |
| `POST` | `/api/strava/sync` | Fetches new activities and runs auto-match. | None | `{ fetched: n, created: n, matched: n }` |
| `GET` | `/api/workouts` | Returns workouts (optional date range query).| None | `ScheduledWorkout[]` |
| `POST` | `/api/workouts` | Creates a new scheduled workout. | JSON payload | `ScheduledWorkout` |
| `PUT` | `/api/workouts/:id` | Updates an existing workout or status. | JSON payload | `ScheduledWorkout` |
| `DELETE`| `/api/workouts/:id` | Deletes a scheduled workout and matches. | None | `{ success: true }` |
| `GET` | `/api/matches` | Returns planned vs actual match records. | None | `WorkoutActivityMatch[]` |
| `POST` | `/api/matches` | Manually matches or unmatches an activity. | `{ workoutId, activityId }` | `WorkoutActivityMatch` |
| `GET` | `/api/analytics` | Returns aggregated volume & progression data.| None | `{ volume: [...], summary: {...} }` |
| `GET` | `/api/insights` | Returns grounded AI coach insights. | None | `TrainingInsight[]` |
| `GET` | `/api/status` | Returns DB & Strava configuration status. | None | `{ database: {...}, strava: {...} }` |
