# Global Error Handling & Resilience Architecture

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** QA Architect & Senior Backend Engineer  
**Related Documents:** [ERROR_HANDLING.md](../04-integrations/ERROR_HANDLING.md)

---

## 1. Standard API Error Response Format
All server route handlers return uniform JSON error structures:
```json
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Strava API 15-minute rate limit reached. Reset in 8 minutes.",
  "status": 429
}
```

## 2. React Error Boundaries
* Dashboard, Calendar, and Analytics components are wrapped in React Error Boundaries to prevent a failure in chart rendering from crashing the entire application.
