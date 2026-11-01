# Data Retention & Deletion Protocols

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Application Security Engineer  
**Related Documents:** [DATA_PRIVACY.md](./DATA_PRIVACY.md)

---

## 1. Retention Policies
* **OAuth Tokens:** Retained until disconnected or revoked by the athlete.
* **Activities & Workouts:** Retained indefinitely to maintain historical periodization analytics unless the athlete requests account purge.
* **Sync Logs:** Pruned after 90 days to prevent unbounded audit table growth.

## 2. Account Disconnect & Purge Protocol
Upon disconnect, access tokens are deauthorized with Strava's API and marked inactive. If an athlete requests full data deletion, a cascading delete removes user records, activities, workouts, and tokens.
