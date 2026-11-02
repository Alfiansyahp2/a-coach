# Athlete Health & Check-in REST API Specifications

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-02  
**Owner:** Senior Full-Stack Engineer  
**Related Documents:** [API_DESIGN.md](./API_DESIGN.md), [ATHLETE_HEALTH_SCHEMA.md](./ATHLETE_HEALTH_SCHEMA.md)

---

## 1. Endpoints Summary

| Endpoint | Method | Scope | Description |
|---|---|---|---|
| `/api/athlete/health-context` | `GET` | Authenticated Athlete | Returns consolidated health profile, active injuries, recent pain logs, and training readiness. |
| `/api/athlete/checkin` | `POST` | Authenticated Athlete | Records post-workout symptoms (pain, swelling, instability, RPE) and triggers readiness recalculation. |
| `/api/athlete/injuries` | `GET`, `POST` | Authenticated Athlete | Lists or registers new injury history records with audit logging. |

---

## 2. API Contract Details

### `GET /api/athlete/health-context`
- **Query Parameters:** `userId` (optional, defaults to session user).
- **Response `200 OK`:**
```json
{
  "success": true,
  "context": {
    "profile": {
      "age": 22,
      "height_cm": 170.0,
      "weight_kg": 65.0,
      "bmi": 22.5,
      "resting_heart_rate": 68,
      "training_days_per_week": 3,
      "preferred_sports": ["Running", "Cycling"],
      "physiological_measurements": {
        "hr_max": null,
        "lthr": null,
        "ftp_watts": null,
        "vo2_max": null
      }
    },
    "injuries": [
      {
        "body_region": "Right Ankle",
        "side": "RIGHT",
        "medical_evaluation_status": "PENDING_CLINICAL_ASSESSMENT",
        "current_status": "ACTIVE_SYMPTOMATIC"
      }
    ],
    "latestReadiness": {
      "athlete_status": "ACTIVE_WITH_UNRESOLVED_SYMPTOMS",
      "running_readiness": "ON_HOLD",
      "cycling_readiness": "CONDITIONAL",
      "medical_clearance": false,
      "automatic_progression_allowed": false
    }
  }
}
```

### `POST /api/athlete/checkin`
- **Request Body:**
```json
{
  "activity_id": "fff8d8e3-972c-4e06-a69b-db1808e3d9b9",
  "sport_type": "Ride",
  "distance_km": 56.10,
  "duration_seconds": 9436,
  "rpe_score": 6.0,
  "pain_during_activity": 0,
  "pain_after_activity": 0,
  "pain_next_day": 0,
  "swelling_observed": false,
  "instability_observed": false,
  "athlete_comments": "Smooth spin, no pain."
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "trainingResponse": { ... },
  "updatedReadiness": {
    "athlete_status": "ACTIVE_WITH_UNRESOLVED_SYMPTOMS",
    "running_readiness": "ON_HOLD",
    "cycling_readiness": "CONDITIONAL"
  }
}
```

