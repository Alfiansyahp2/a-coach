# Detailed Feature Specifications

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Senior Product Manager & Software Architect  
**Related Documents:** [PRD.md](./PRD.md), [FUNCTIONAL_REQUIREMENTS.md](./FUNCTIONAL_REQUIREMENTS.md)

---

## Specification: FEAT-004 — Planned vs Actual Workout Comparison Engine

### 1. Purpose & User Problem
Athletes routinely suffer from pacing errors—running easy recovery runs too fast (inhibiting recovery) or running tempo intervals too slow. This feature compares prescribed target metrics against real Strava telemetry to evaluate execution adherence.

### 2. User Flow
1. User schedules a workout: e.g. Wednesday, "Tempo Run", Target: 10.00 km, Target Pace: 05:00 min/km.
2. User runs on Wednesday and records the activity on their GPS watch; watch syncs to Strava.
3. User triggers sync (or background sync fires).
4. System automatically binds the Strava activity to the Wednesday Tempo Run.
5. User navigates to the Comparison view or Wednesday calendar slot:
   - System renders the Comparison Card showing target vs actual side-by-side.

### 3. Inputs & Outputs
* **Inputs:**
  * `ScheduledWorkout`: `target_distance_meters`, `target_duration_seconds`, `target_pace_seconds_per_km`, `workout_category`.
  * `Activity`: `distance_meters`, `moving_time_seconds`, `average_speed_mps`, `sport_type`.
* **Outputs:**
  * `WorkoutActivityMatch`: `completion_percentage`, `distance_delta_meters`, `duration_delta_seconds`, `pace_delta_seconds_per_km`, `is_manual_match`.

### 4. Business Rules & Edge Cases
* **Edge Case 1 (Multiple Activities in One Day):** If an athlete logs a morning warmup (2 km) and an evening tempo run (10 km), the heuristic matching algorithm pairs the activity with the closest distance match to the prescribed session.
* **Edge Case 2 (Manual Override):** A user can click "Unmatch" or select any activity from a dropdown modal to manually pair with the planned workout.
* **Pace Sign Convention:** Faster pace than target results in a negative delta ($Delta P < 0$); slower pace results in a positive delta ($Delta P > 0$).
