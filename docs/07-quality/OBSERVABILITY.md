# Observability, Structured Logging & Metrics

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Site Reliability Engineer  
**Related Documents:** [ERROR_HANDLING.md](./ERROR_HANDLING.md)

---

## 1. Structured Logging
All synchronization attempts and OAuth handshakes log structured JSON to stdout and the `sync_logs` database table:
```json
{
  "timestamp": "2026-11-01T12:00:00Z",
  "level": "INFO",
  "event": "STRAVA_SYNC_COMPLETED",
  "user_id": "00000000-0000-0000-0000-000000000001",
  "activities_fetched": 3,
  "activities_created": 1,
  "matches_found": 1,
  "rate_limit_usage": "14/100"
}
```
