# External API Error Handling Matrix

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** QA Architect & Senior Backend Engineer  
**Related Documents:** [STRAVA_INTEGRATION.md](./STRAVA_INTEGRATION.md)

---

## 1. Error Mapping & Resolution Protocols

| Error Condition | HTTP Code | Root Cause | System Response |
| :--- | :--- | :--- | :--- |
| **Invalid Authorization Code** | 400 | Code already exchanged or expired. | Redirects to `/?error=exchange_failed`; prompts user to retry. |
| **Expired Access Token** | 401 | Token lived past 6-hour window. | Triggers pre-flight `refresh_token` exchange automatically. |
| **Revoked Permissions** | 401 | Athlete deauthorized app on Strava web. | Deactivates `strava_connections`; sets `is_active = false`. |
| **Rate Limit Exceeded** | 429 | Exceeded 100 req / 15 min. | Halts paging; logs to `sync_logs`; informs athlete of reset time. |
| **Missing Credentials** | N/A | Missing `STRAVA_CLIENT_ID` in `.env`. | Displays Strava Setup Banner in UI with instructions. |
