# Official Strava API v3 Integration Overview

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** API Integration Specialist  
**Related Documents:** [STRAVA_OAUTH_FLOW.md](./STRAVA_OAUTH_FLOW.md), [STRAVA_API_REFERENCE.md](./STRAVA_API_REFERENCE.md)

---

## 1. Integration Objectives
The platform integrates with the official Strava API v3 as an external activity data provider. The primary objective is reading authorized endurance activities (runs, rides, swims) and ingesting them into the platform for comparative analysis against planned workouts.

## 2. Integration Principles
* **Read-Centric:** The MVP reads activity streams and summaries. It does not perform destructive write actions to Strava.
* **Respect Rate Limits:** Request batching and incremental timestamps ensure the platform stays well within Strava's 100 req / 15 min threshold.
* **Zero Client Exposure:** All requests to `https://www.strava.com` are mediated by Next.js server route handlers.
