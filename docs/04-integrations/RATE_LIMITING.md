# Strava API Rate Limiting & Throttling Governance

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** API Integration Specialist & Reliability Engineer  
**Related Documents:** [ERROR_HANDLING.md](./ERROR_HANDLING.md)

---

## 1. Official Rate Limits
* **Short-Term Limit:** 100 requests per 15 minutes.
* **Long-Term Limit:** 1,000 requests per calendar day (UTC).

## 2. Throttling & Protection Strategy
1. **Incremental Sync:** Passing `?after=` ensures that 95% of daily sync calls require only a single HTTP request (1 page of results).
2. **Header Telemetry:** On every call, read `x-ratelimit-limit` and `x-ratelimit-usage`. If usage exceeds 85% of the 15-minute quota, the system halts automated background polling until the window resets.
3. **HTTP 429 Interception:** If a 429 response is encountered, the sync engine records `status = 'RATE_LIMITED'` in `sync_logs` and surfaces a clear message to the athlete.
