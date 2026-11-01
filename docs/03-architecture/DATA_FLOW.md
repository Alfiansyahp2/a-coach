# End-to-End Data Flow Architecture

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Principal Software Architect  
**Related Documents:** [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md)

---

## 1. Primary Data Pipeline
```
[Strava Wearable / Device]
       │
       ▼ (User completes activity)
[Strava API v3]
       │
       ▼ (GET /api/v3/athlete/activities?after=...)
[Next.js Server API: /api/strava/sync]
       │
       ├─► 1. Verify / Auto-refresh OAuth Tokens
       ├─► 2. Ingest Activities (JSON Array)
       ├─► 3. Decrypt / Transform / Normalize
       ├─► 4. Upsert into 'activities' Table (Idempotent)
       ├─► 5. Execute Auto-Match Heuristic
       │        └─► Match against 'scheduled_workouts'
       │        └─► Calculate Deltas (Distance, Pace, Duration)
       │        └─► Insert 'workout_activity_matches'
       │        └─► Update workout status to 'COMPLETED'
       ├─► 6. Evaluate Grounded AI Insights (ACWR, 10% rule)
       └─► 7. Record 'sync_logs'
       │
       ▼ (JSON Response)
[Athlete Dashboard UI]
       │
       ├─► Updates Weekly KPI Cards
       ├─► Renders Comparison Card (Target vs Actual)
       ├─► Updates Volume & Pace Charts
       └─► Surfaces AI Coach Recommendations
```
