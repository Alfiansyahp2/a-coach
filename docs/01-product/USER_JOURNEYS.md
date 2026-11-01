# User Journeys & Workflow Diagrams

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Senior UX Researcher & Principal UI Designer  
**Related Documents:** [USER_STORIES.md](./USER_STORIES.md), [PRD.md](./PRD.md)

---

## 1. Journey 1: First-Time Onboarding & Strava Authorization

```mermaid
sequenceDiagram
    autonumber
    actor Athlete
    participant App as Platform UI
    participant Auth as Auth Handler (/api/auth)
    participant Strava as Strava OAuth Dialog

    Athlete->>App: Opens application home
    App-->>Athlete: Displays "Connect with Strava" onboarding prompt
    Athlete->>App: Clicks "Connect with Strava"
    App->>Auth: GET /api/auth/strava/authorize
    Auth-->>Athlete: 302 Redirect to Strava OAuth with state
    Athlete->>Strava: Reviews scopes (read, activity:read_all) & clicks "Authorize"
    Strava-->>Auth: Callback GET /api/auth/strava/callback?code=...&state=...
    Auth->>Auth: Exchange code, encrypt tokens (AES-256-GCM), persist connection
    Auth-->>App: Redirect to /?connected=true
    App-->>Athlete: Displays Athlete Profile & prompts "Sync First Activities"
```

---

## 2. Journey 2: Weekly Workout Planning

```mermaid
sequenceDiagram
    autonumber
    actor Athlete
    participant Planner as Weekly Planner UI
    participant API as Workouts API (/api/workouts)
    participant DB as Database

    Athlete->>Planner: Navigates to "Training Plan" view
    Planner-->>Athlete: Displays current 7-day grid (Monday to Sunday)
    Athlete->>Planner: Clicks "+ Add Workout" on Wednesday
    Planner-->>Athlete: Opens Workout Creation Modal
    Athlete->>Planner: Selects "Tempo Run", enters 10 km, target pace 5:00 min/km, Zone 4
    Athlete->>Planner: Clicks "Save Workout"
    Planner->>API: POST /api/workouts (payload)
    API->>DB: Insert into scheduled_workouts
    DB-->>API: Return created workout record
    API-->>Planner: 201 Created
    Planner-->>Athlete: Wednesday slot updates with Volt badge "Tempo Run • 10.00 km"
```

---

## 3. Journey 3: Activity Synchronization & Planned vs Actual Comparison

```mermaid
sequenceDiagram
    autonumber
    actor Athlete
    participant UI as Dashboard / Comparison UI
    participant Sync as Sync API (/api/strava/sync)
    participant Match as Matching Engine
    participant DB as Database

    Athlete->>UI: Completes run outside, returns home, clicks "Sync Activities"
    UI->>Sync: POST /api/strava/sync
    Sync->>Sync: Refresh token if needed, fetch net-new activities from Strava
    Sync->>DB: Upsert ingested activities
    Sync->>Match: runAutoMatch(userId, newActivities)
    Match->>DB: Query scheduled_workouts for matching date & sport
    Match->>Match: Calculate distance delta (+420m), pace delta (-5s/km), completion (104%)
    Match->>DB: Save workout_activity_matches & update workout status to COMPLETED
    Sync-->>UI: 200 OK (1 new activity matched)
    UI-->>Athlete: Displays Comparison Card: "Planned: 10.00 km @ 5:00 | Actual: 10.42 km @ 4:55 (+104%)"
```
