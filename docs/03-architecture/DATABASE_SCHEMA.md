# Database Schema & Relational Specifications

**Status:** CONFIRMED & AUDITED  
**Version:** 2.0  
**Last Updated:** 2026-11-03  
**Owner:** Database Architect & Sports Science Engineer  
**Related Documents:** [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md), [ATHLETE_HEALTH_SCHEMA.md](./ATHLETE_HEALTH_SCHEMA.md)

---

## 1. Relational Entities Summary (16 Normalized Tables)

### A. Core Platform & Telemetry Entities
1. **`users`**: Primary athlete accounts (`id` UUID PK, `email`, `name`, `avatar_url`).
2. **`strava_connections`**: Multi-tenant Strava athlete binding (`strava_athlete_id`, `scopes`, `is_active`).
3. **`strava_tokens`**: AES-256-GCM encrypted `access_token` and `refresh_token` with expiration timestamps.
4. **`activities`**: Raw ingested multi-sport activities (`distance_meters`, `moving_time_seconds`, `average_speed_mps`, `elevation_gain_meters`, `sport_type`).
5. **`training_plans`**: Structured periodization containers (`title`, `start_date`, `end_date`, `target_event`, `is_active`).
6. **`scheduled_workouts`**: Prescribed sessions with target distance, duration, pace, category, and status (`PLANNED`, `COMPLETED`, `MISSED`, `SKIPPED`).
7. **`workout_activity_matches`**: Heuristic bindings between scheduled workouts and actual activities, calculating variance deltas.
8. **`fitness_goals`**: Macro milestones and progressive targets with live achievement tracking (`is_achieved`, `target_value`, `current_value`).
9. **`personal_records`**: Benchmarked best achievements across Running (5K, 10K, Longest, Pace) and Cycling (Longest, Speed, Elevation, 40K+).
10. **`sync_logs`**: Immutable audit logs recording every synchronization run, activity counts, and rate limits.

### B. Athlete Health Intelligence & Clinical Dossier Entities
11. **`athlete_profiles`**: Longitudinal biometrics (`resting_hr_bpm`, `max_hr_bpm`, `weight_kg`, `height_cm`, `sleep_target_hours`, `vo2max_estimate`).
12. **`athlete_injuries`**: Medical injury registry (`body_part`, `anatomical_location`, `injury_name`, `severity`, `diagnosis_date`, `recovery_status`).
13. **`athlete_pain_logs`**: Longitudinal post-activity pain check-ins (`pain_score_1_to_10`, `pain_type`, `swelling_observed`, `onset_time`).
14. **`athlete_training_responses`**: Subjective exertion and recovery telemetry (`rpe_score_1_to_10`, `joint_discomfort_observed`, `notes`).
15. **`athlete_medical_assessments`**: Clinical consultation records, diagnostic scans, and physician notes.
16. **`athlete_training_readiness`**: Computed readiness permission per sport (`discipline`, `readiness_status`, `safe_distance_cap_km`, `safe_cadence_min_rpm`).

---

## 2. Complete DDL Script
Refer to root file `schema.sql` for the executable PostgreSQL DDL including all UUID generation defaults, foreign key constraints with cascading deletes, and optimized b-tree indexes.
