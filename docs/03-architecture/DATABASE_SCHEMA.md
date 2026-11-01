# Database Schema & Relational Specifications

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Database Architect  
**Related Documents:** [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md)

---

## 1. Relational Entities Summary
* **`users`**: Primary athlete entity with UUID PK.
* **`strava_connections`**: Stores authorized Strava athlete ID, username, and granted scopes.
* **`strava_tokens`**: Stores AES-256-GCM encrypted access and refresh tokens with expiration timestamps.
* **`activities`**: Raw ingested Strava activities with unique `strava_activity_id`.
* **`scheduled_workouts`**: Prescribed workouts with target distance, duration, pace, and status.
* **`workout_activity_matches`**: Pairs scheduled workouts with actual activities, calculating variances.
* **`fitness_goals`**: Monthly and weekly training goals with dynamic progress tracking.
* **`personal_records`**: Benchmarked best times across standard distances (5K, 10K, Half, etc.).
* **`sync_logs`**: Audit logs recording every API synchronization attempt.

## 2. Complete DDL Script
Refer to root file `schema.sql` for executable PostgreSQL DDL including all UUID defaults, foreign keys, and indexes.
