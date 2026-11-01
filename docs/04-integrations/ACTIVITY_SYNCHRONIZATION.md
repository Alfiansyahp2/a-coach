# Activity Synchronization Strategy & Pipelines

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Senior Backend Engineer  
**Related Documents:** [STRAVA_INTEGRATION.md](./STRAVA_INTEGRATION.md)

---

## 1. Ingestion Pipeline Mechanics
1. **Timestamp Lookup:** The server queries `SELECT MAX(start_date) FROM activities WHERE user_id = $1`.
2. **Epoch Conversion:** The timestamp is converted to epoch seconds (`afterTimestamp`).
3. **Paging Request:** The server calls Strava with `?after={afterTimestamp}&per_page=100`.
4. **Idempotent Upsert:** Each incoming activity is upserted into the database using `ON CONFLICT (strava_activity_id) DO UPDATE`.
5. **Auto-Match Trigger:** For all newly inserted activities, `runAutoMatch(userId, newActivities)` runs to automatically link them with scheduled workouts.
6. **Audit Entry:** Records total fetched, created, and updated into `sync_logs`.
